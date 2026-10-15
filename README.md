# limits-handy

Zeigt deine Claude-Code-Limits auf dem Android-Handy – in der App **Claude Limits**, im Widget, auf dem Sperrbildschirm
und in der Statusleiste: wie viel vom 5-Stunden-Fenster und vom Wochenlimit verbraucht ist, wann es zurückgesetzt wird
und welche Claude-Code-Tabs gerade arbeiten oder auf dich warten.

Dieser Mod läuft in Claude Code auf deinem Computer (Desktop-App oder Terminal, Mac, Windows oder Linux) und meldet
die Zahlen ans Handy.

## Einrichten – in drei Schritten

**Du brauchst:** Claude Code auf deinem Computer und die App „Claude Limits“ auf dem Handy.

### 1. Mod installieren

Öffne Claude Code und schick Claude diesen Satz:

> Installiere github.com/bonnibonni13-star/limits-handy als Skill nach ~/.claude/skills/limits-handy

Claude lädt den Mod herunter. Wenn Claude fragt, ob es den Befehl ausführen darf, antworte mit **Ja**.

### 2. PIN holen

Öffne in Claude Code eine **neue Sitzung** und tippe:

```
/handy-koppeln
```

Claude zeigt dir eine 6-stellige PIN.

### 3. PIN eingeben

Öffne die App „Claude Limits“, trag die PIN bei **Schritt 3** ein und tippe auf **Koppeln**.

Fertig. Ab der nächsten Antwort von Claude siehst du deine Limits auf dem Handy.

## Häufige Fragen

**Die PIN ist abgelaufen.** Sie gilt 15 Minuten. Tippe einfach noch einmal `/handy-koppeln`.

**`/handy-koppeln` gibt es nicht.** Der Mod lädt erst in einer neuen Sitzung. Schließ die Sitzung und öffne eine neue.
Mod und Befehl brauchen Claude Code 2.1.286 oder neuer.

**Ich habe mehrere Computer.** Installiere den Mod auf jedem Computer und kopiere die Datei `~/.claude-limits/config`
vom ersten Computer auf die anderen. Dann melden alle aufs selbe Handy.

**Muss ich mich in der App bei Claude anmelden?** Nein. Deine Claude-Anmeldung bleibt auf deinem Computer. Die App
bekommt nur die Zahlen, die Claude Code ohnehin anzeigt.

**Updates:** Schick Claude „Aktualisiere den Skill in ~/.claude/skills/limits-handy mit git pull“.

**Entfernen:** Lösch den Ordner `~/.claude/skills/limits-handy` (und `~/.claude-limits`). In der App „Entkoppeln“ tippen.

## Was gesendet wird

Nur Zahlen und Namen: Prozent und Reset-Zeit beider Limits (aus `$.session.usage()`), Sitzungs-ID, Titel und Ordner
eines Tabs, ob er arbeitet oder wartet, und der Name des Computers. **Nie gesendet:** deine Nachrichten, Claudes
Antworten, Dateien oder Anmeldedaten. Die Daten liegen in einem Briefkasten (Supabase), den nur Geräte mit deinem
zufälligen Kopplungscode lesen können; vom Code wird nur ein SHA-256-Hash gespeichert. Tabs ohne Lebenszeichen
verschwinden nach 24 Stunden.

## Für Entwickler

Mod für Claude Code (Hooks-Modul in `hooks/register.ts`). Claude Code lädt Plugins aus `~/.claude/skills/<name>/`
automatisch (`limits-handy@skills-dir`); alternativ `/plugin install limits-handy --marketplace bonnibonni13-star/limits-handy`.
Tests: `claude plugin test .`
