# GitHub: Repository und Release

Nur Vorbereitung. Hochladen und Veröffentlichen machst du selbst (Konto nötig).

## 1. Repository anlegen

Auf github.com: **New repository**, Name z. B. `ac-evo-streamdeck`, Public, ohne README (das liegt schon hier).

Im Projektordner (`Documents\Claude\AC-Evo-StreamDeck`), in PowerShell:

```powershell
git init
git add .
git commit -m "AC Evo Live 1.0.0"
git branch -M main
git remote add origin https://github.com/<DEIN-NAME>/ac-evo-streamdeck.git
git push -u origin main
```

`dist/` steht in der `.gitignore`. Das Paket kommt als **Release-Datei**, nicht ins Repository.

## 2. Release anlegen

Repository → **Releases** → **Draft a new release**

- **Tag:** `v1.0.0` (neu anlegen)
- **Titel:** `AC Evo Live 1.0.0`
- **Datei anhängen:** `dist/com.nils.acevo.streamDeckPlugin`
- **Beschreibung:** Text unten einfügen.

SHA-256 der Datei (zum Prüfen; nach jedem neuen Build neu bilden mit `Get-FileHash dist\com.nils.acevo.streamDeckPlugin`):

```
CCC83A9BDDDD62483DB4F51B613DB462FEFAE614014EEC1129A9D509F7670F77
```

## 3. Beschreibung für das Release (Deutsch + English)

---

### AC Evo Live 1.0.0

Stream-Deck-XL-Profil und Plugin für **Assetto Corsa EVO** mit Live-Werten aus SimHub.

**Enthalten**
- Seite 1 **Steuern**: Licht, Blinker, Wischer, Pit Limiter, Zündung, Starter, ABS/TC/TC-Cut/Map/Bremsbalance mit +/− und Live-Wert
- Seite 2 **Reifen**: Temperatur, Druck und Verschleiß der vier Reifen in V-Anordnung
- Seite 3 **Info**: Rundenzeiten, Delta, Position, Temperaturen, Bremsen, Schaden
- Seite 4 **Hilfe** (englisch): Erklärung und die Taste **SETUP KEYS** / **TASTEN EINRICHTEN**, die die Tastenbelegung in AC EVO einträgt (mit Backup)
- **Flag-Modus**: Die Werte-Tasten blinken oder bleiben in der Farbe der aktiven Flagge (pro Taste einstellbar)

**Installation**
1. `com.nils.acevo.streamDeckPlugin` herunterladen und doppelklicken.
2. SimHub starten, dann AC EVO. Das Profil **AC Evo | XL** schaltet sich beim Spielstart ein.
3. Einmalig: AC EVO beenden, auf Seite 4 die grüne Taste **SETUP KEYS** (deutsche App: **TASTEN EINRICHTEN**) drücken.

**Voraussetzungen:** Stream Deck XL, Stream-Deck-Software 6.4+, Windows 10/11, SimHub (Web-API Port 8888).

**Bekannte Einschränkungen:** nur XL; TC-Cut hat in SimHub keinen Wert für EVO; Hotkey-Tasten zeigen keinen Zustand.

---

**AC Evo Live 1.0.0 (English)**

Stream Deck XL profile and plugin for **Assetto Corsa EVO** with live values from SimHub: car controls, tyres in a V layout, race info, a help page, a flag mode that flashes the value keys in the active flag colour, and a one-press key that writes the required key bindings into AC EVO (backup first).

Install: download the `.streamDeckPlugin` file and double-click it. Requires a Stream Deck XL, Stream Deck software 6.4+, Windows 10/11 and SimHub running (web API on port 8888). Close AC EVO before pressing the green **SETUP KEYS** key on page 4 (German Stream Deck app: TASTEN EINRICHTEN).

Unofficial community project, not affiliated with Kunos Simulazioni, Elgato/Corsair or SimHub. MIT licence.
