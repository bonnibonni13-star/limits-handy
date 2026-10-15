import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

// Claude Limits: meldet Sitzungs- und Wochenlimit sowie den Status dieses Tabs an den
// Briefkasten, aus dem die Android-App liest. Läuft im Terminal und in der Desktop-App.
// Gesendet werden nur Zahlen, Zeiten, Sitzungs-ID, Ordner, Titel und Gerätename –
// nie ein Prompt oder eine Antwort.

const BRIEFKASTEN = 'https://qrivbqxjaivirfmircbv.supabase.co/functions/v1/briefkasten'
const BEFEHL = 'handy-koppeln'
const LIMITS_BUENDELN_MS = 5_000
const LEBENSZEICHEN_MS = 15 * 60_000

type Status = 'arbeitet' | 'wartet'
type Konfig = { briefkasten: string; code: string }

// Die Ereignisnamen, die der Briefkasten auch von den Hook-Skripten kennt.
const EREIGNIS: Record<Status | 'beendet', string> = {
  arbeitet: 'UserPromptSubmit',
  wartet: 'Stop',
  beendet: 'SessionEnd',
}

let titel: string | undefined
let status: Status | undefined
let turnLaeuft = false
let offeneLimits: SessionRateLimit[] | undefined
let limitsTimer = false
let geraet: Promise<string | null> | undefined

async function konfigPfad($: EngineInterface): Promise<string | null> {
  const heim = (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE'))
  return heim ? `${heim.replace(/[\\/]+$/, '')}/.claude-limits/config` : null
}

function konfigLesen(text: string): Konfig | null {
  const wert = (name: string) => text.match(new RegExp(`^${name}=(.+)$`, 'm'))?.[1]?.trim()
  const code = wert('CODE')
  return code && code.length >= 32 ? { briefkasten: wert('BRIEFKASTEN') ?? BRIEFKASTEN, code } : null
}

/** Liest ~/.claude-limits/config (gemeinsam mit den Hook-Skripten); legt sie beim ersten Mal an. */
async function konfig($: EngineInterface, anlegen = true): Promise<{ konfig: Konfig; neu: boolean } | null> {
  const pfad = await konfigPfad($)
  if (!pfad) return null
  const vorhanden = await $.fs.read(pfad).then(konfigLesen, () => null)
  if (vorhanden) return { konfig: vorhanden, neu: false }
  if (!anlegen) return null
  const zufall = crypto.getRandomValues(new Uint8Array(24))
  const code = [...zufall].map(b => b.toString(16).padStart(2, '0')).join('')
  await $.fs.write(pfad, `BRIEFKASTEN=${BRIEFKASTEN}\nCODE=${code}\n`)
  await $.process.run(['chmod', '600', pfad]).catch(() => undefined)
  // Zwei Sitzungen, die gleichzeitig starten: es gilt, was zuletzt in der Datei steht.
  const gelesen = await $.fs.read(pfad).then(konfigLesen, () => null)
  return { konfig: gelesen ?? { briefkasten: BRIEFKASTEN, code }, neu: true }
}

async function geraetsname($: EngineInterface): Promise<string | null> {
  const windows = await $.env.get('COMPUTERNAME')
  if (windows) return windows
  for (const argv of [['scutil', '--get', 'ComputerName'], ['hostname']]) {
    const r = await $.process.run(argv, { timeoutMs: 3_000 }).catch(() => undefined)
    const name = r?.exitCode === 0 ? r.stdout.trim() : ''
    if (name) return name
  }
  return null
}

async function senden($: EngineInterface, body: Record<string, unknown>): Promise<unknown> {
  const k = await konfig($)
  if (!k) return undefined
  geraet ??= geraetsname($).catch(() => null)
  const antwort = await $.http.fetch(k.konfig.briefkasten, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-kopplung': k.konfig.code },
    body: JSON.stringify({ ...body, geraet: await geraet }),
  })
  if (!antwort.ok) $.ui.log(`limits-handy: Briefkasten antwortet ${antwort.status}`, { to: 'debug' })
  return antwort.ok ? JSON.parse(antwort.text) : undefined
}

const leise = (p: Promise<unknown>) => void p.catch(() => undefined)

async function tabMelden($: EngineInterface, neu: Status | 'beendet', sessionId?: string) {
  if (neu !== 'beendet') status = neu
  await senden($, {
    aktion: 'tab',
    ereignis: EREIGNIS[neu],
    session_id: sessionId ?? (await $.session.id()),
    cwd: await $.session.cwd(),
    titel,
  })
}

/** Nur wenn sich der Status ändert – Werkzeugaufrufe kommen oft im Sekundentakt. */
function statusSetzen($: EngineInterface, neu: Status) {
  if (status !== neu) leise(tabMelden($, neu))
}

/** Bündelt die Messungen eines Turns zu einer Meldung. */
function limitsVormerken($: EngineInterface, liste: readonly SessionRateLimit[]) {
  const fenster = liste.filter(l => l.kind === 'five_hour' || l.kind === 'seven_day')
  if (fenster.length === 0) return
  offeneLimits = fenster
  if (limitsTimer) return
  limitsTimer = true
  $.clock.after(LIMITS_BUENDELN_MS, () => {
    limitsTimer = false
    const rate_limits = offeneLimits
    offeneLimits = undefined
    if (rate_limits) leise(senden($, { aktion: 'limits', rate_limits }))
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({
      name: BEFEHL,
      description: 'Claude Limits: PIN anzeigen, um dein Android-Handy zu koppeln',
    })
    leise(
      (async () => {
        const k = await konfig($)
        if (k?.neu) $.ui.toast(`Claude Limits: Mit /${BEFEHL} koppelst du dein Handy.`)
        await tabMelden($, 'wartet')
        const { rateLimits } = await $.session.usage()
        limitsVormerken($, rateLimits)
      })(),
    )
    $.clock.every(LEBENSZEICHEN_MS, () => leise(tabMelden($, status ?? 'wartet')))
    return started
  })

  // Der Titel, den die Desktop-App der Sitzung gibt. Der Prompt selbst wird nicht gelesen.
  on('classic.SessionStart', ($, e, next) => {
    if (e.session_title) titel = e.session_title
    return next(e)
  })
  on('classic.UserPromptSubmit', ($, e, next) => {
    if (e.session_title) titel = e.session_title
    return next(e)
  })

  on('turn.start', ($, e, next) => {
    turnLaeuft = true
    statusSetzen($, 'arbeitet')
    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      turnLaeuft = false
      statusSetzen($, 'wartet')
    }
    return next(e)
  })

  // Freigabe nötig oder Rückfrage: der Tab wartet auf dich.
  on('classic.Notification', ($, e, next) => {
    if (e.notification_type === 'permission_prompt' || e.notification_type === 'elicitation_dialog') {
      statusSetzen($, 'wartet')
    }
    return next(e)
  })

  // Nach einer Freigabe geht es weiter.
  on('tool.call', async ($, e, next) => {
    if (turnLaeuft) statusSetzen($, 'arbeitet')
    const ergebnis = await next(e)
    if (turnLaeuft) statusSetzen($, 'arbeitet')
    return ergebnis
  })

  on('session.measure', ($, e, next) => {
    if (e.changed.includes('rateLimits')) limitsVormerken($, e.rateLimits)
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    const zeit = Math.max(0, Math.min(2_000, next.budget.remainingMs - 300))
    await Promise.race([tabMelden($, 'beendet', e.sessionId).catch(() => undefined), $.clock.sleep(zeit)])
    const beendet = await next(e)
    if (e.reason === 'clear') {
      // /clear: dieselbe Sitzung läuft unter neuer ID weiter.
      titel = undefined
      turnLaeuft = false
      $.clock.after(1_000, () => leise(tabMelden($, 'wartet')))
    }
    return beendet
  })

  on('command.run', { command: BEFEHL }, async $ => {
    const r = (await senden($, { aktion: 'koppeln-start' }).catch(() => undefined)) as
      | { pin?: string }
      | undefined
    if (!r?.pin) return { text: 'Claude Limits: Die PIN konnte gerade nicht abgeholt werden. Bitte später noch einmal.' }
    return {
      text:
        `Kopplungs-PIN fürs Handy: ${r.pin}\n` +
        'In der Handy-App „Claude Limits“ bei Schritt 3 eintragen und auf „Koppeln“ tippen. Gültig für 15 Minuten.',
    }
  })
}
