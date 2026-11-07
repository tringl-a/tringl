# Trading Journal

Persönliches Trading-Journal als **eine einzige HTML-Datei** (`app/index.html`).
Läuft als Desktop-App (Electron) **und** als installierbare Web-App (PWA) auf dem Handy.

- **Kein Server, keine Cloud, kein Login.** Alle Daten liegen im `localStorage` des jeweiligen Geräts/Browsers.
- **Kein automatischer Sync.** Desktop und Handy haben jeweils eigene Daten.
  Übertragung nur manuell: **JSON-Backup** auf Gerät A → Datei auf Gerät B → **Importieren**
  (der Import fügt nur Trades hinzu, deren ID noch nicht existiert).
- Das JSON-Backup enthält die **Trades** (inkl. Fotos). Regeln/Strategien und das Tagesverlust-Limit
  sind nicht im Backup und müssen pro Gerät eingerichtet werden.

```
app/
  index.html            die komplette App
  manifest.json         PWA-Manifest (Name, Icons, Farben)
  sw.js                 Service Worker (Offline-Cache)
  icon.png / icon.ico   App-Icon (Electron)
  icons/                PWA-Icons 192/512, maskable, apple-touch-icon
main.js, package.json   Electron-Desktop-App
build-deb.js            Linux-.deb bauen
```

---

## Auf dem Handy nutzen

Für „Zum Home-Bildschirm hinzufügen“ und Offline-Betrieb muss die App über **HTTPS** erreichbar sein.

### Option A – GitHub Pages (empfohlen, schon vorbereitet)

Der Workflow `.github/workflows/pages.yml` veröffentlicht den Ordner `app/`.

1. Repo auf GitHub → **Settings → Pages → Build and deployment → Source: „GitHub Actions“**.
   (GitHub Pages ist kostenlos nur für **öffentliche** Repos. Öffentlich ist nur der App-Code –
   deine Trades liegen ausschließlich lokal auf deinen Geräten.)
2. **Actions → „Deploy to GitHub Pages“ → Run workflow** (danach automatisch bei jedem Push auf `main`).
3. Die App ist dann erreichbar unter **https://tringl-a.github.io/tringl/**

### Option B – Netlify (Drag & Drop, ohne Git)

1. https://app.netlify.com/drop öffnen.
2. Den Ordner **`app`** ins Browserfenster ziehen → du bekommst eine HTTPS-URL.

### Option C – Vercel

```bash
npx vercel deploy app --prod
```

### Option D – Nur im Heim-WLAN (ohne Hosting)

Auf dem PC im Projektordner:

```bash
python3 -m http.server 8000 --directory app
# oder: npx serve app
```

Dann am Handy (gleiches WLAN) `http://<IP-des-PCs>:8000` öffnen
(IP unter Linux/macOS: `ip a` bzw. `ifconfig`, Windows: `ipconfig`).

Einschränkungen: funktioniert nur, solange der PC läuft und im selben Netz ist; ohne HTTPS gibt es
keinen Offline-Modus und (je nach Browser) kein richtiges App-Icon. Gut zum Testen, für den Alltag
besser Option A–C.

### App installieren

- **iPhone (Safari):** Teilen-Button → **„Zum Home-Bildschirm“**.
- **Android (Chrome):** Menü ⋮ → **„App installieren“** bzw. „Zum Startbildschirm hinzufügen“.

Danach startet die App im Vollbild und funktioniert auch offline.

> **Wichtig:** Die Daten hängen am Browser **und** an der Adresse. Eine Installation von
> `https://tringl-a.github.io/tringl/` sieht nicht die Daten einer `http://192.168.…`-Version.
> Browserdaten löschen oder die App deinstallieren löscht auch das Journal –
> **regelmäßig „JSON-Backup“ machen.** Auf dem iPhone die App unbedingt zum Home-Bildschirm
> hinzufügen; im normalen Safari-Tab kann iOS lokale Daten nach längerer Nichtnutzung löschen.

### Updates

Der Service Worker startet die App aus dem Cache und lädt im Hintergrund die neue Version.
Nach einem Update: App einmal schließen und neu öffnen. Bei Änderungen an der App
`CACHE_VERSION` in `app/sw.js` erhöhen.

---

## Desktop (Electron)

```bash
npm install
npm start               # App starten
npm run package-win     # Windows-Build
node build-deb.js       # Linux-.deb (nach dem Packaging für linux-x64)
```

Electron lädt dieselbe `app/index.html` per `file://`. Der Service Worker wird dort bewusst
nicht registriert; alles andere ist identisch.
