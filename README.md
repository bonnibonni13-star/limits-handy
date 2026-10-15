# limits-handy

Claude-Code-Mod für die Android-App **Claude Limits**: Er meldet Sitzungslimit (5-Stunden-Fenster), Wochenlimit und
die offenen Tabs aufs Handy – aus der Claude-Desktop-App (Code-Tab) und aus dem Terminal. Läuft ab Claude Code 2.1.286.

## Installieren

```bash
gh repo clone bonnibonni13-star/limits-handy ~/.claude/skills/limits-handy
```

Claude Code lädt den Ordner ab der nächsten neuen Sitzung automatisch (als `limits-handy@skills-dir`); an den
Einstellungen ändert sich nichts. Aktualisieren: `git -C ~/.claude/skills/limits-handy pull`. Entfernen: den Ordner löschen.

## Koppeln

In einer neuen Sitzung `/handy-koppeln` eingeben und die PIN in der App unter *Einrichten → Datenquelle* eintragen
(15 Minuten gültig). Beim ersten Start legt der Mod `~/.claude-limits/config` mit einem zufälligen Kopplungscode an.
Weitere Rechner: Mod installieren und diese Datei vom ersten Rechner übernehmen.

## Was gesendet wird

Prozent und Reset-Zeit beider Limits (aus `$.session.usage()`), Sitzungs-ID, Titel und Ordner des Tabs, Status
(*arbeitet* / *wartet*) und der Rechnername – an die Supabase-Funktion `briefkasten`. Nie gesendet: Prompts, Antworten,
Dateien. Der Briefkasten speichert vom Kopplungscode nur den SHA-256-Hash.

Tests: `claude plugin test .`
