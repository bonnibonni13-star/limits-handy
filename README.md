# Limit Ring – Claude-Code-Limits aufs Handy

Die Android-App **Limit Ring** zeigt dir, wie viel von deinem Claude-Code-Limit verbraucht ist – in der App, im Widget,
auf dem Sperrbildschirm und in der Statusleiste:

- **Sitzung:** wie viel vom 5-Stunden-Fenster weg ist und wann es zurückgesetzt wird
- **Woche:** seit wann die Woche läuft und wie viel vom Wochenlimit verbraucht ist
- **Offene Tabs:** welche Claude-Code-Sitzungen gerade arbeiten oder auf dich warten

Die Zahlen kommen von Claude Code auf deinem Computer (Desktop-App oder Terminal; Mac, Windows oder Linux). Dafür
installierst du dort einmal den kleinen Mod aus diesem Repo.

*Limit Ring ist ein privates Projekt und gehört nicht zu Anthropic.*

## Einrichten

**Du brauchst:** ein Android-Handy (ab Android 12) und Claude Code auf deinem Computer.

### 1. App aufs Handy

Öffne auf dem Handy diesen Link und lade die App herunter:

**[limit-ring.apk herunterladen](https://github.com/bonnibonni13-star/limits-handy/releases/latest/download/limit-ring.apk)**

Tippe auf die heruntergeladene Datei. Android fragt, ob dein Browser Apps installieren darf – erlauben. Warnt Google
Play Protect vor einer unbekannten App, tippe auf *Weitere Details → Trotzdem installieren*.

### 2. Mod installieren

Öffne Claude Code auf deinem Computer und schick Claude diesen Satz (er steht auch in der App zum Kopieren):

> Installiere github.com/bonnibonni13-star/limits-handy als Skill nach ~/.claude/skills/limits-handy

Wenn Claude fragt, ob es den Befehl ausführen darf, antworte mit **Ja**.

### 3. Koppeln

Öffne in Claude Code eine **neue Sitzung** und tippe:

```
/handy-koppeln
```

Claude zeigt dir eine 6-stellige PIN. Trag sie in der App bei **Schritt 3** ein und tippe auf **Koppeln**.

Fertig. Ab der nächsten Antwort von Claude siehst du deine Limits auf dem Handy.

## Häufige Fragen

**Die PIN ist abgelaufen.** Sie gilt 15 Minuten. Tippe einfach noch einmal `/handy-koppeln`.

**`/handy-koppeln` gibt es nicht.** Der Mod lädt erst in einer neuen Sitzung. Schließ die Sitzung und öffne eine neue.
Mod und Befehl brauchen Claude Code 2.1.286 oder neuer.

**Muss ich mich in der App bei Claude anmelden?** Nein. Deine Claude-Anmeldung bleibt auf deinem Computer. Die App
bekommt nur die Zahlen, die Claude Code ohnehin anzeigt.

**Ich habe mehrere Computer.** Installiere den Mod auf jedem Computer und kopiere die Datei `~/.claude-limits/config`
vom ersten Computer auf die anderen. Dann melden alle aufs selbe Handy.

**Die Insel um die Kamera lässt sich nicht einschalten.** Bei Apps, die nicht aus dem Play Store kommen, sperrt Android
die Bedienungshilfe zuerst: *Einstellungen → Apps → Limit Ring → ⋮ (oben rechts) → Eingeschränkte Einstellungen
zulassen*, danach erneut einschalten. Die Insel liest keine Bildschirminhalte.

**Updates:** Neue App-Version einfach über den Link oben installieren. Den Mod aktualisierst du, indem du Claude
schickst: „Aktualisiere den Skill in ~/.claude/skills/limits-handy mit git pull“.

**Entfernen:** In der App „Entkoppeln“ tippen und die App löschen. Auf dem Computer die Ordner
`~/.claude/skills/limits-handy` und `~/.claude-limits` löschen.

## Datenschutz

Gesendet werden nur Zahlen und Namen: Prozent und Reset-Zeit beider Limits, Titel und Ordner deiner offenen Tabs,
ob sie arbeiten oder warten, und der Name deines Computers. **Nie gesendet:** deine Nachrichten, Claudes Antworten,
Dateien oder Anmeldedaten. Einzelheiten: [DATENSCHUTZ.md](DATENSCHUTZ.md).

## Für Entwickler

Mod für Claude Code (Hooks-Modul in `hooks/register.ts`, Tests mit `claude plugin test .`). Claude Code lädt Plugins
aus `~/.claude/skills/<name>/` automatisch (`limits-handy@skills-dir`); alternativ
`/plugin install limits-handy --marketplace bonnibonni13-star/limits-handy`.
