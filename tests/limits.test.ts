import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const HOME = '/Users/test'
const PFAD = `${HOME}/.claude-limits/config`
const CODE = 'a'.repeat(48)

type Meldung = { url: string; kopplung: string | undefined; body: Record<string, any> }

/** Die Welt unter dem Mod: Dateien, Netz und Prozesse aus dem Speicher. */
function welt(on: On, dateien: Record<string, string> = {}) {
  const meldungen: Meldung[] = []
  const toasts: string[] = []
  mock.env(on, { HOME })
  on('fs.read', ($, e) => (e.path in dateien ? { value: dateien[e.path] } : { deny: 'ENOENT' }))
  on('fs.write', ($, e) => {
    dateien[e.path] = e.text
    return { value: undefined }
  })
  on('process.run', ($, e) => ({
    value: { exitCode: 0, stdout: e.argv[0] === 'scutil' ? 'Testrechner\n' : '', stderr: '' },
  }))
  on('http.fetch', ($, e) => {
    const body = JSON.parse(String(e.init?.body))
    meldungen.push({ url: e.url, kopplung: e.init?.headers?.['x-kopplung'], body })
    const text = body.aktion === 'koppeln-start' ? '{"ok":true,"pin":"K7M2QX"}' : '{"ok":true}'
    return { value: { status: 200, ok: true, headers: {}, text } }
  })
  on('session.id', () => ({ value: 'sitzung-1' }))
  on('session.cwd', () => ({ value: '/Users/test/Projekte/Rezepte' }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200_000 }, rateLimits: [] } }))
  on('command.register', () => ({ value: undefined }))
  on('ui.toast', ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.log', () => ({ value: undefined }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('classic.UserPromptSubmit', () => ({}))
  on('classic.Notification', () => ({}))
  return { meldungen, toasts, dateien }
}

const starten = ($: any) => $.session.start({ cwd: '/Users/test/Projekte/Rezepte', surface: 'desktop', isInteractive: true })

test('legt beim ersten Start einen Kopplungscode an und meldet den Tab', async ($, on) => {
  const uhr = mock.clock(on)
  const w = welt(on)
  await starten($)
  await uhr.settle()

  expect(w.dateien[PFAD]).toMatch(/^BRIEFKASTEN=https:\/\/.+\nCODE=[0-9a-f]{48}\n$/)
  expect(w.toasts[0]).toContain('/handy-koppeln')
  const tab = w.meldungen.find(m => m.body.aktion === 'tab')!
  expect(tab.body).toEqual({
    aktion: 'tab',
    ereignis: 'Stop',
    session_id: 'sitzung-1',
    cwd: '/Users/test/Projekte/Rezepte',
    geraet: 'Testrechner',
  })
  expect(tab.kopplung).toBe(w.dateien[PFAD].match(/CODE=(\w+)/)![1])
})

test('nutzt eine vorhandene Konfiguration der Hook-Skripte', async ($, on) => {
  const uhr = mock.clock(on)
  const w = welt(on, { [PFAD]: `BRIEFKASTEN=https://beispiel.test/briefkasten\nCODE=${CODE}\n` })
  await starten($)
  await uhr.settle()

  expect(w.toasts).toEqual([])
  expect(w.meldungen[0].url).toBe('https://beispiel.test/briefkasten')
  expect(w.meldungen[0].kopplung).toBe(CODE)
})

test('Limits gebündelt senden, nur Fünf-Stunden- und Wochenfenster', async ($, on) => {
  const uhr = mock.clock(on)
  const w = welt(on, { [PFAD]: `CODE=${CODE}\n` })
  await starten($)
  await uhr.settle()

  const messen = (fuenf: number) =>
    $.session.measure({
      context: { window: 200_000 },
      changed: ['rateLimits'],
      rateLimits: [
        { kind: 'five_hour', percentUsed: fuenf, resetsAt: '2026-10-15T18:00:00Z' },
        { kind: 'seven_day', percentUsed: 31, resetsAt: '2026-10-22T09:00:00Z' },
        { kind: 'spend_limit', percentUsed: 5 },
      ],
    })
  await messen(41)
  await messen(42)
  await uhr.advance(5_000)

  const limits = w.meldungen.filter(m => m.body.aktion === 'limits')
  expect(limits.length).toBe(1)
  expect(limits[0].body.rate_limits).toEqual([
    { kind: 'five_hour', percentUsed: 42, resetsAt: '2026-10-15T18:00:00Z' },
    { kind: 'seven_day', percentUsed: 31, resetsAt: '2026-10-22T09:00:00Z' },
  ])
})

test('Tab-Status folgt dem Turn und sendet nie den Prompt', async ($, on) => {
  const uhr = mock.clock(on)
  const w = welt(on, { [PFAD]: `CODE=${CODE}\n` })
  await starten($)
  await uhr.settle()

  await $.classic.UserPromptSubmit({ prompt: 'GEHEIMER PROMPTTEXT', session_title: 'Limits aufs Handy' })
  await $.turn.start({ text: 'GEHEIMER PROMPTTEXT', turnId: 't1' })
  await uhr.settle()
  await $.classic.Notification({ message: 'Freigabe?', notification_type: 'permission_prompt' })
  await uhr.settle()
  await $.turn.complete({ reason: 'answer', answer: 'GEHEIME ANTWORT', durationMs: 10, isAborted: false, turnId: 't1' })
  await uhr.settle()

  const tabs = w.meldungen.filter(m => m.body.aktion === 'tab').map(m => m.body)
  expect(tabs.map(t => t.ereignis)).toEqual(['Stop', 'UserPromptSubmit', 'Stop'])
  expect(tabs[1].titel).toBe('Limits aufs Handy')
  expect(JSON.stringify(w.meldungen)).not.toContain('GEHEIM')
})

test('/handy-koppeln zeigt die PIN, Sitzungsende löscht den Tab', async ($, on) => {
  const uhr = mock.clock(on)
  const w = welt(on, { [PFAD]: `CODE=${CODE}\n` })
  await starten($)
  await uhr.settle()

  const r = await $.command.run({ command: 'handy-koppeln', args: '' } as any)
  expect(r.text).toContain('K7M2QX')

  await $.session.end({ reason: 'prompt_input_exit', sessionId: 'sitzung-1', resume: { id: 'sitzung-1' } } as any)
  expect(w.meldungen.at(-1)!.body).toMatchObject({ aktion: 'tab', ereignis: 'SessionEnd', session_id: 'sitzung-1' })
})
