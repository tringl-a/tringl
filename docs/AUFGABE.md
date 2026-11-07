# Trading Journal → auf dem Handy nutzbar machen (PWA, ohne Cloud-Sync)

## Ausgangslage
`app/index.html` ist eine fertige Single-File-Web-App (Vanilla JS, kein
Build-Tool nötig) für ein persönliches Trading-Journal. Aktuell läuft sie als
Electron-Desktop-App (`main.js` + `package.json`, gebaut als .deb) und
speichert alles nur in `localStorage` des jeweiligen Geräts.

Vorhandene Features in `app/index.html` (bitte alle erhalten):
- Trade-Eintrag: Datum, Instrument, Richtung, P/L (USD), Kontrakte, RR
  (Risk/Reward), Setup/Tag, Emotion, Notizen, mehrere Foto-Anhänge (als
  Data-URLs in `entries[].photos`)
- Journal-Tab: Tabelle aller Trades, Tag-Filter, Löschen
- Kalender-Tab: Monatsansicht, Gewinn/Verlust-Färbung pro Tag, Foto-Icon pro
  Tag öffnet Modal mit allen Fotos des Tages
- Statistik-Tab: Equity-Kurve (SVG) mit Hover-Tooltip pro Punkt, Streaks,
  Performance nach Tag/Setup
- Regeln-Tab: Strategien mit Feldern Einstiegsregeln/Confirmation/TP-Regel/
  SL-Regel + Checkliste zum Abhaken vor dem Trade
- Risk-Guard: Tagesverlust-Limit-Balken
- JSON-Backup-Export/Import, CSV-Export

Datenmodelle (localStorage-Keys, siehe `<script>` in `app/index.html`):
- `trading_journal_entries_v1`: Array von Trade-Objekten
  `{id, date, instrument, direction, size, pnl, rr, tag, emotion, notes, photos[], createdAt}`
- `trading_journal_risk_limit_v1`: Zahl oder null
- `trading_journal_rules_v1`: Array von Regel-Objekten
  `{id, name, entry, confirmation, tp, sl, checklist:{entry,confirmation,tp,sl}, createdAt}`

**Wichtig: KEIN automatischer Sync zwischen Geräten.** Desktop und Handy
führen jeweils ihre eigenen, lokal gespeicherten Daten (eigenes
`localStorage` pro Browser/Gerät). Übertragung zwischen Geräten läuft
weiterhin nur manuell über den vorhandenen JSON-Export/Import. Kein Backend,
keine Cloud-Datenbank, kein Login, kein eigener Server – bewusst einfach
halten.

## Ziel: Progressive Web App (PWA)
1. **Installierbar/offline-fähig machen**
   - `manifest.json` anlegen (Name "Trading Journal", Icons aus
     `app/icon.png` in 192px/512px generieren, `display: standalone`,
     `theme_color`/`background_color` passend zum Dark-Theme `#0B0F14`,
     Akzent Gold `#D4A54A`).
   - Service Worker (`sw.js`) für Offline-Caching der statischen Datei
     (`index.html`, Icons). Reiner Cache-first/App-Shell-Ansatz reicht, da es
     keine Server-Requests gibt (`localStorage` ist bereits offline-fähig).
   - `<link rel="manifest">` und Service-Worker-Registrierung in
     `app/index.html` ergänzen.

2. **Responsive Layout für Handy**
   - Aktuell feste Grids (`.form-grid3`, `.stats` = 4 Spalten,
     `.streak-row` = 4 Spalten) brechen auf schmalen Screens (< 600px).
     Per Media Queries auf 1–2 Spalten umstellen.
   - Tabs, Buttons und Formularfelder für Touch-Bedienung groß genug machen
     (mind. ~44px Tap-Ziel).
   - Journal-Tabelle auf kleinen Screens entweder horizontal scrollbar machen
     oder in eine Karten-Liste umwandeln (pro Trade eine Karte statt
     Tabellenzeile).
   - Kalendergrid (`.cal-grid`, 7 Spalten) und Equity-Chart (SVG, aktuell feste
     `viewBox`-Breite 880) auf schmalen Viewports testen und ggf. Schriftgrößen/
     Innenabstände anpassen.
   - Modal (Fotoansicht) und Formulare so anpassen, dass sie auf kleinen
     Screens nicht über den Rand gehen (z. B. `max-width: 100vw`,
     Padding reduzieren).

3. **Desktop-Version weiter funktionsfähig halten**
   - `main.js`/Electron lädt weiterhin dieselbe `app/index.html` lokal –
     daran ändert sich nichts. Es dürfen keine Electron-spezifischen APIs
     genutzt werden (werden aktuell ohnehin nicht verwendet), damit die
     gleiche Datei im Browser (PWA) wie in Electron läuft.
   - Service-Worker-Registrierung mit `if ('serviceWorker' in navigator)`
     abschirmen, falls das in Electrons Webview Probleme machen sollte.

## Hosting (für die Handy-Nutzung)
- Die PWA muss unter einer HTTPS-URL erreichbar sein (Service Worker und
  "Zum Home-Bildschirm hinzufügen" brauchen HTTPS; `localhost` funktioniert
  zum Testen auch ohne HTTPS).
- Einfachste Optionen ohne eigenes Server-Setup: GitHub Pages, Netlify oder
  Vercel (kostenlose Tiers, einfach ein statisches Verzeichnis hochladen/
  verbinden). Bitte eine kurze Anleitung ergänzen, wie der Nutzer selbst
  deployen kann (z. B. `npx serve` zum lokalen Test, dann Drag-&-Drop-Deploy
  bei Netlify oder `vercel deploy`).
- Alternativ, falls kein Hosting gewünscht ist: Anleitung, wie man die Datei
  lokal im Handy-Browser über das heimische WLAN erreichbar macht (z. B.
  `python3 -m http.server` auf dem PC, dann `http://<PC-IP>:8000` im
  Handy-Browser öffnen – funktioniert nur im selben Netzwerk, ohne HTTPS
  aber auch ohne "Add to Home Screen"-Icon in allen Browsern).

## Vorgehen (Vorschlag)
1. Responsive CSS ergänzen (Media Queries ab 600px/400px Breakpoints) in
   `app/index.html`.
2. Icons (192px/512px) aus `app/icon.png` generieren.
3. `manifest.json` + `sw.js` anlegen, in `index.html` verlinken/registrieren.
4. Lokal testen: `npx serve app` (oder vergleichbar), im Handy-Browser
   (gleiches WLAN) über die PC-IP öffnen, Layout und "Add to Home Screen"
   prüfen.
5. Optional auf Netlify/Vercel/GitHub Pages deployen, damit es von überall
   per HTTPS erreichbar ist.
6. Electron-Desktop-Version (`main.js`) gegen die geänderte `index.html`
   testen, damit nichts kaputt geht.

## Mitgelieferte Dateien
- `app/index.html` – aktuelle vollständige App (v1.4.0, alle Features)
- `app/icon.png`, `app/icon.ico` – App-Icon
- `main.js` – aktuelles Electron-Hauptprozess-Skript
- `package.json` – aktuelle Electron-Build-Konfiguration
- `build-deb.js` – Skript zum Bauen des Linux-.deb-Pakets (für die
  Desktop-Variante, falls weiter gepflegt)

## Offene Entscheidungen für den Nutzer (bitte am Anfang kurz abfragen)
- Journal-Tabelle auf Mobile: horizontal scrollbar oder lieber als
  Karten-Liste pro Trade?
- Soll am Ende ein Hosting-Dienst (Netlify/Vercel/GitHub Pages) eingerichtet
  werden, oder reicht vorerst der lokale Zugriff übers Heim-WLAN zum Testen?
