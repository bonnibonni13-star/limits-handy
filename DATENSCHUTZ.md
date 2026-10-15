# Datenschutzerklärung – Limit Ring

Stand: 15. Oktober 2026

Diese Erklärung gilt für die Android-App **Limit Ring** und den Claude-Code-Mod **limits-handy**. Limit Ring ist ein
privates Projekt und gehört nicht zu Anthropic.

## Kurz gesagt

- Kein Konto, keine Anmeldung, keine Werbung, kein Tracking, keine Analyse-Dienste.
- Übertragen werden nur die Zahlen und Namen, die die App anzeigt – **nie** deine Nachrichten an Claude, Claudes
  Antworten, Dateien oder Anmeldedaten.
- Die Daten werden verschlüsselt übertragen, liegen auf einem Server in Frankfurt und werden automatisch gelöscht.

## Welche Daten verarbeitet werden

Der Mod auf deinem Computer sendet:

| Daten | Wozu |
|---|---|
| Prozent und Reset-Zeit des 5-Stunden-Fensters und des Wochenlimits | Anzeige der Limits |
| Sitzungs-ID, Titel und Ordnerpfad (mit `~` gekürzt) offener Claude-Code-Tabs, Status (*arbeitet* / *wartet*), Zeitpunkte | Anzeige der offenen Tabs |
| Name deines Computers | Anzeige, von welchem Computer die Daten kommen |
| Kopplungscode (gespeichert wird nur sein SHA-256-Hash) | Zuordnung von Computer und Handy |

Beim Koppeln entsteht eine 6-stellige PIN, die 15 Minuten gilt. Die App selbst sendet nur die PIN (beim Koppeln) und
fragt danach mit dem Kopplungscode den aktuellen Stand ab.

Wie bei jeder Internetverbindung sieht der Server die IP-Adresse der anfragenden Geräte; sie wird nicht in der
Datenbank gespeichert.

## Wo die Daten liegen

Auf einem Server von **Supabase** (Supabase Inc.) im Rechenzentrum **Frankfurt am Main** (Region eu-central-1).
Die Übertragung ist per HTTPS verschlüsselt. Lesen und schreiben kann nur, wer den zufälligen Kopplungscode kennt –
also dein Computer und dein gekoppeltes Handy.

## Wie lange

- Tabs ohne Lebenszeichen: nach **24 Stunden** gelöscht
- PINs: nach **15 Minuten** ungültig, abgelaufene werden täglich gelöscht
- Alles andere (Limits, Kopplung): nach **90 Tagen** ohne Meldung gelöscht

Sofort löschen: Mod und den Ordner `~/.claude-limits` auf dem Computer entfernen und in der App „Entkoppeln“ tippen;
die Daten auf dem Server verfallen dann nach den Fristen oben. Auf Wunsch löschen wir sie sofort.

## Zweck und Rechtsgrundlage

Die Daten werden ausschließlich verarbeitet, um dir deine eigenen Claude-Code-Limits und Tabs auf deinem Handy
anzuzeigen (Art. 6 Abs. 1 lit. b DSGVO). Sie werden nicht weitergegeben, nicht verkauft und nicht ausgewertet.

## Berechtigungen der App

- **Internet:** Stand vom Server abholen
- **Benachrichtigungen:** Live-Update auf dem Sperrbildschirm und in der Statusleiste
- **Start nach Neustart:** Live-Update und Widgets nach einem Neustart wieder anzeigen
- **Bedienungshilfe (nur in der Version von GitHub, freiwillig):** zeichnet die Insel um die Frontkamera. Der Dienst
  liest keine Bildschirminhalte und keine Eingaben.

## Deine Rechte

Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit sowie
das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.

## Kontakt

Fragen und Löschwünsche: über die [Issues dieses Repositorys](https://github.com/bonnibonni13-star/limits-handy/issues).
