# Elgato Marketplace: Einreichung vorbereiten

Nur Vorbereitung. Konto, Upload und Einreichung machst du selbst in der **Maker Console** (https://maker.elgato.com). Rückfragen zum Prüfstatus: maker@elgato.com.
Quellen: [Submitting Products](https://docs.elgato.com/maker-console/submitting-products/), [Plugin Guidelines](https://docs.elgato.com/guidelines/stream-deck/plugins/).

## Vorher entscheiden (nach Veröffentlichung nicht mehr änderbar bzw. riskant)

1. **Plugin-UUID.** Laut Elgato muss sie Autor/Organisation und Plugin-Namen enthalten und lässt sich nach der Veröffentlichung **nicht mehr ändern**. Aktuell: `com.nils.acevo`. Wenn du unter einem anderen Namen oder Alias veröffentlichen willst, jetzt anpassen (Ordner `plugin/com.nils.acevo.sdPlugin`, `manifest.json`, `plugin.js`, Profil).
2. **Name / Marken.** Elgato verlangt, dass der Name keine Marken verletzt. „Assetto Corsa EVO" ist eine Marke von Kunos Simulazioni. „AC Evo Live" enthält die Abkürzung. Ob das durchgeht, entscheidet Elgato. Neutrale Alternative: **„Evo Live Dash"** oder **„Sim Live Keys"**; in der Beschreibung darf das Spiel als unterstütztes Spiel genannt werden.
3. **Autor.** Im Manifest steht „Nils". Elgato akzeptiert Organisationsname, echten Namen oder Alias.
4. **Sprache.** Erledigt: Das Paket enthält die englische Hilfe-Seite und englische Seitennamen (Controls, Tyres, Info, Help), das Manifest und das Einstellungsfeld sind englisch (Einstellungsfeld und Einrichten-Taste sind bei deutscher Stream-Deck-App deutsch). Eine offizielle Übersetzungsdatei (`de.json`) habe ich nicht angelegt, weil ich das Format nicht sicher kenne.
5. **Support-Link.** Die Guidelines wollen Hilfe/Support-Links. Dafür bietet sich die GitHub-Seite an (siehe `GITHUB_RELEASE.md`).

## Was die Guidelines prüfen, und wie der Stand ist

| Punkt | Anforderung | Stand |
|---|---|---|
| Plugin-Icon | PNG 256×256 und 512×512 | erledigt: `marketplace/plugin-icon-256.png`, `plugin-icon-512.png`, im Plugin als `images/plugin-icon(.png/@2x.png)` |
| Kategorie-Icon | 28×28, einfarbig weiß (#FFFFFF), transparent | erledigt: `images/category.svg` |
| Aktions-Icons | 20×20, einfarbig weiß, transparent | erledigt: `action-display.svg`, `action-setup.svg` |
| Tasten-Bilder | 72×72 (144×144 hochauflösend) | SVG 144×144, wird skaliert |
| Anzahl Aktionen | 2 bis 30 | 2 (Anzeige, Einrichten) |
| Namen | Aktionen/Kategorie höchstens 30 Zeichen | ok |
| Property Inspector | kein „Speichern"-Knopf, automatisch speichern | ok (speichert bei Änderung) |
| Rückmeldung | `showAlert` bei Fehlschlag, `showOk` bei Erfolg | ok (Taste „Tasten einrichten") |
| Update-Rate | höchstens 10 programmatische Bild-Updates pro Sekunde | **teilweise offen**: Bilder werden nur bei Änderung gesendet. Pro Taste sind es höchstens 2 Updates pro Sekunde (Blinken im 0,5-s-Takt). Ob Elgato die Grenze pro Taste oder für das ganze Plugin meint, geht aus der Seite nicht klar hervor. Für den Fall „ganzes Plugin" gibt es im Einstellungsfeld die Option **On: key stays in the flag colour** (dauerhaft, kein Blinken). Für die Einreichung wäre „dauerhaft" als Standard sicherer. |
| SDK-Version | – | Manifest hat `SDKVersion: 2`. Elgato verlangt für neue Plugins evtl. das neuere SDK. Vor dem Einreichen mit dem offiziellen CLI (`streamdeck validate`, benötigt npm) prüfen. Von mir nicht getestet. |

## Angaben für die Maker Console

**Produkttyp:** Stream Deck Plugin (Datei: `dist/com.nils.acevo.streamDeckPlugin`)

**Name:** AC Evo Live *(oder neutrale Alternative, siehe oben)*

**Tags:** Stream Deck XL · Windows · Assetto Corsa EVO · SimHub · sim racing · telemetry

**Preis:** kostenlos

**Kurzbeschreibung (English):**
Live telemetry keys and car controls for Assetto Corsa EVO on the Stream Deck XL.

**Beschreibung (English, unter 1500 Zeichen):**

> Turn your Stream Deck XL into a dashboard and button box for Assetto Corsa EVO.
>
> **4 pages, ready to use**
> • Car controls: lights, indicators, wipers, pit limiter, ignition, starter and ABS / TC / TC-cut / engine map / brake bias with +/− keys and a live value in the middle of each group
> • Tyres: temperature, pressure and wear for all four tyres in a V layout
> • Race info: current, last and best lap, delta, position, laps, time left, speed, RPM, oil / air / track temperature, brake temperatures, damage, fuel range
> • Help page with a one-press setup key
>
> **Flag mode:** when a flag is active, the value keys flash in the flag colour.
>
> **One-press key setup:** the key bindings the profile needs are written into AC EVO automatically (your existing bindings file is backed up first). Close the game, press the green key, done.
>
> **Requirements:** Stream Deck XL, Stream Deck software 6.4 or newer, Windows 10/11, SimHub running with AC EVO support (web API on port 8888).
>
> Icons and layout are original artwork. Unofficial community project, not affiliated with Kunos Simulazioni, Elgato, Corsair or SimHub.

**Zusätzliche Links:** GitHub-Seite des Projekts (Support, Quellcode), SimHub (https://www.simhubdash.com)

**Release Notes (English):**
> 1.0.0 – First release. Four pages (controls, tyres, race info, help), live values from SimHub, flag mode, one-press key setup with backup.

## Medien (Dateien im Ordner `marketplace/`)

| Verwendung | Datei | Größe |
|---|---|---|
| Thumbnail | `thumbnail.png` | 1920×960 PNG |
| Galerie 1 (Pflicht: 3) | `gallery-1.png` Steuern | 1920×960 PNG |
| Galerie 2 | `gallery-2.png` Reifen mit Flag-Modus | 1920×960 PNG |
| Galerie 3 | `gallery-3.png` Info | 1920×960 PNG |
| Galerie 4 (optional) | `gallery-4.png` Hilfe und Einrichten | 1920×960 PNG |
| App-Icon | `plugin-icon-512.png` (und 256) | PNG |

Die Bilder sind aus dem Profil gerenderte Darstellungen mit Beispielwerten, keine Fotos vom echten Deck. Neu erzeugen: `powershell -ExecutionPolicy Bypass -File build\render-marketplace.ps1`. Galerie 4 zeigt die deutsche Hilfe-Seite. Vor der Einreichung passend zur englischen Fassung neu rendern.
