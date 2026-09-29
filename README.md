# AC Evo Live for Stream Deck

Stream-Deck-Profil und Plugin für **Assetto Corsa EVO**: Elektronik-Tasten (ABS, TC, Map, Bremsbalance, Licht, Blinker …) plus **Live-Anzeigen** und **Flag-Modus**, angelehnt an das Layout von JustPush! für ACC.

*Stream Deck profile and plugin for Assetto Corsa EVO: electronics keys plus live displays and a flag mode. Layout inspired by JustPush! for ACC. English notes at the bottom.*

## Download und Installation

**Nur die Datei `com.nils.acevo.streamDeckPlugin` herunterladen, den Rest des Repositories brauchst du zum Benutzen nicht.**

1. Auf der Seite [Releases](https://github.com/Nils-Keys/ac-evo-streamdeck/releases/latest) unter **Assets** die Datei `com.nils.acevo.streamDeckPlugin` herunterladen.
2. **Doppelklick** auf die Datei. Die Stream-Deck-Software installiert das Plugin und legt das Profil **AC Evo | XL** an.
3. SimHub starten, dann AC EVO. Beim ersten Mal AC EVO beenden und auf Seite 4 die grüne Taste zum Einrichten der Tastenbelegung drücken (Details unten).

Ordner wie `plugin`, `profile`, `icons` und `build` enthalten nur den Quellcode zum Selbstbauen.

**English:** download `com.nils.acevo.streamDeckPlugin` from the [latest release](https://github.com/Nils-Keys/ac-evo-streamdeck/releases/latest) and double-click it. The Stream Deck software installs the plugin and the **AC Evo | XL** profile. The other folders in this repository are source code only.

## Was du bekommst

- **Profil „AC Evo | XL"** für das Stream Deck XL (8 × 4 Tasten), vier Seiten:
  - **Seite 1 Elektronik:** Pit Limiter, Zündung, Starter, Blinker links/rechts, Licht, Lichthupe, Regenlicht, Warnblinker, ABS/TC/TC-Cut/Bremsbalance/Motor-Map jeweils mit +/− und Live-Wert in der Mitte, dazu Sprit, Gang und Limiter-Status.
  - **Seite 2 Reifen (V-Anordnung):** Temperatur, Druck und Verschleiß aller vier Reifen, dazu Sprit, Gang, ABS, TC, Map und Bremsbalance. Freie Felder zeigen die Flagge.
  - **Seite 3 Rennen & Info:** aktuelle, letzte und beste Runde, Delta, Position, Runden, Restzeit, Speed, Drehzahl, Gang, Öl-, Luft- und Streckentemperatur, Schaden, Sprit-Reichweite, Sektor, Bremsentemperaturen sowie Reifen-Durchschnitt und -Verschleiß.
  - **Seite 4 Hilfe:** Kurzerklärung der Seiten in Text-Kacheln, die Anleitung in drei Schritten und die grüne Taste **TASTEN EINRICHTEN** selbst (unten rechts).
- **Plugin „AC Evo Live"** mit der Aktion *Evo Anzeige*. Sie zeigt einen Wert aus SimHub an (Auswahl im Einstellungsfeld der Taste).
- **Flag-Modus:** Bei gelber, blauer, grüner, weißer, orangener, schwarzer oder Zielflagge blinken die Anzeige-Tasten in der Flaggenfarbe. Pro Taste im Einstellungsfeld wählbar: blinkend, dauerhaft oder aus.
- **Sprache:** Das Verteilpaket ist englisch (Hilfe-Seite, Seitennamen, Einstellungsfeld). Die Taste zum Einrichten und das Einstellungsfeld folgen der Sprache der Stream-Deck-App (Deutsch: „TASTEN EINRICHTEN", sonst „SETUP KEYS"). Das Installationspaket enthält die englische Hilfe-Seite. Eine deutsche Fassung erzeugt `build/gen-help.js` ohne das Argument `en`.
- Eigene Icons im einheitlichen Look (unter `icons/`, per `build/gen-icons.js` erzeugt).

## Voraussetzungen

- **Stream Deck XL** und Stream-Deck-Software **6.4 oder neuer** (getestet mit 7.4), Windows 10/11.
- **SimHub** muss laufen und AC EVO unterstützen. Die Anzeigen lesen die SimHub-Web-API auf `http://localhost:8888`.
- **Tastenbelegung in AC EVO.** Die Tasten des Profils senden diese Standardkürzel. Stelle sie unter *Einstellungen → Steuerung* so ein:

| Funktion | Taste |
|---|---|
| Pit Limiter | Alt + L |
| Zündung | Umschalt + I |
| Anlasser | S |
| Scheinwerfer durchschalten | L |
| Lichthupe | Umschalt + L |
| Blinker links / rechts | Alt + Pos1 / Alt + Ende |
| ABS + / − | Umschalt + A / Strg + A |
| TC + / − | Umschalt + T / Strg + T |
| Motorkennfeld + / − | Umschalt + E / Strg + E |
| Bremsbalance + / − | Umschalt + B / Strg + B |
| TC-Cut + / − | Umschalt + Y / Strg + Y |
| Regenscheinwerfer | Strg + L |
| Warnblinker | Alt + H |
| Scheibenwischer | Alt + W |

Das sind die ACC-Standardkürzel, die JustPush! verwendet (Warnblinker: Alt + H). In EVO ist nicht alles ab Werk belegt.

### Tastenbelegung automatisch eintragen (Taste „TASTEN EINRICHTEN")

Auf **Seite 4** (Hilfe) des Profils liegt unten rechts die grüne Taste **TASTEN EINRICHTEN**. Sie trägt alle Belegungen aus der Tabelle in AC EVO ein:

1. **AC EVO beenden.** Das Spiel überschreibt die Datei beim Beenden. Läuft es noch, zeigt die Taste CLOSE EVO.
2. Die grüne Taste drücken. Sie zeigt danach DONE OK.
3. AC EVO starten und unter *Einstellungen → Steuerung* prüfen.

Es wird zuerst ein **Backup** angelegt (input_keyboard.keyboardinputconfiguration.bak-<Zeitstempel> im Ordner Saved Games\ACE). Ersetzt werden nur die Belegungen der Funktionen aus der Tabelle, alle anderen bleiben erhalten. Bereits vorhandene Belegungen dieser Funktionen werden überschrieben. Ohne Stream Deck geht dasselbe mit 
ode evo-bindings.js im Plugin-Ordner (Option --dry zeigt nur, was passieren würde).

## Installation

1. Doppelklick auf `com.nils.acevo.streamDeckPlugin` (aus den Releases). Die Stream-Deck-Software installiert das Plugin und legt das Profil **AC Evo | XL** an.
2. SimHub starten, dann AC EVO.
3. Das Profil ist an `AssettoCorsaEVO.exe` gekoppelt und schaltet sich beim Spielstart ein. Sonst in der Stream-Deck-Software über *Zugehörige Anwendung* zuweisen.

## Bekannte Einschränkungen

- Nur **Stream Deck XL**. Für andere Größen muss das Profil angepasst werden.
- **TC-Cut** zeigt „--": SimHub liefert für AC EVO keinen Wert dafür.
- Die Hotkey-Tasten (Licht, Blinker, +/−) sind normale Stream-Deck-Aktionen mit festem Bild und zeigen keinen Zustand und keinen Flag-Modus.
- Kein Pit-MFD, keine Auto-Fuel/Auto-Pressure-Funktion: AC EVO hat kein ACC-Pit-Menü.
- Die Taste „TASTEN EINRICHTEN" ändert die Tastenbelegung von AC EVO. Sie wurde mit AC EVO (Stand September 2026) getestet. Ändert Kunos das Dateiformat, kann es zu Fehlern kommen; das Backup liegt dann neben der Datei.
- Der Reifendruck wird aus SimHub (bar) in PSI umgerechnet.
- Die Flaggenwerte kommen von SimHub. Im echten Spiel ist der Flag-Modus noch nicht ausgiebig getestet, im Simulationstest blinkt er wie vorgesehen.

## Selbst bauen

```powershell
# Icons neu erzeugen (nutzt jedes Node 18+)
node build\gen-icons.js icons
# Paket bauen -> dist\com.nils.acevo.streamDeckPlugin
powershell -ExecutionPolicy Bypass -File build\build.ps1
```

Ordner: `plugin/` (Plugin-Quelltext, reines Node ohne Abhängigkeiten), `profile/` (Profil-Quelle), `icons/`, `build/`, `dist/`.

## Hinweis

Inoffizielles Community-Projekt. Nicht verbunden mit Kunos Simulazioni, Elgato/Corsair, SimHub oder JustPush! SimRacing. Alle Icons sind selbst gezeichnet. Lizenz: MIT (siehe `LICENSE`).

---

## English

Profile and plugin for **Assetto Corsa EVO** on the Stream Deck XL: electronics keys (ABS, TC, map, brake bias, lights, indicators …), live values from **SimHub** and a **flag mode** that flashes the display keys in the colour of the active flag. Requires SimHub running (web API on port 8888) and the key bindings from the table above set in AC EVO. Install by double-clicking `com.nils.acevo.streamDeckPlugin`. XL only; TC-cut has no SimHub value for EVO; hotkey keys cannot show state or flags.
