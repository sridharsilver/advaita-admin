# Building the Advaita Admin Android App (TWA)

A Trusted Web Activity wraps your deployed admin panel into a native Android APK.  
No code is bundled in the APK — it loads your live Cloudflare Pages site in a full-screen Chrome tab.

---

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js 18+ | Bubblewrap CLI | Already installed |
| Java JDK 11+ | Android build tools | `brew install openjdk@11` |
| Android SDK | Build the APK | Installed via Bubblewrap on first run |

---

## Step 1: Update Your Domain

Edit `twa-manifest.json` in this directory and replace `YOUR_DOMAIN_HERE` with your actual production domain:

```
"host": "advaitadesigns.pages.dev"
```

(or your custom domain like `admin.advaitadesigns.com`)

---

## Step 2: Initialize & Build with Bubblewrap

```bash
# From the android/ directory
npx -y @nickvision/nickvision-coin@latest init --manifest https://YOUR_DOMAIN/admin-manifest.json

# Build the APK
npx -y @nickvision/nickvision-coin@latest build
```

On first run, Bubblewrap will:
- Download and install Android SDK tools automatically
- Generate a signing keystore (save the password!)
- Produce `app-release-signed.apk`

---

## Step 3: Install on Your Phone

1. Transfer `app-release-signed.apk` to your Android phone (via USB, AirDroid, Google Drive, etc.)
2. Open the file on your phone
3. If prompted, enable **"Install from Unknown Sources"** in Settings
4. Install and open the app

---

## Step 4: Verify Digital Asset Links

For the app to show without a browser URL bar, you need domain verification:

1. Get your signing key's SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore ./advaita-admin.keystore -alias advaita-admin
   ```

2. Copy the `SHA256` fingerprint (looks like `AB:CD:EF:...`)

3. Update `public/.well-known/assetlinks.json` — replace the placeholder with your fingerprint

4. Deploy the updated file to your live site:
   ```bash
   cd .. && npm run build && npx wrangler pages deploy dist
   ```

---

## How It Works

- ✅ **Auto-updates**: The APK loads your live website — any changes you deploy to Cloudflare Pages appear instantly
- ✅ **Push notifications**: Handled by the service worker in the web app, displayed as native Android notifications
- ✅ **Offline**: Shows cached admin shell when offline
- ✅ **No rebuild needed**: Only rebuild the APK if you change the manifest, icons, or signing key

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Browser URL bar showing | `assetlinks.json` not deployed or fingerprint mismatch |
| Push notifications not working | Check VAPID keys in Cloudflare env vars |
| App crashes on open | Ensure Chrome is installed and up to date on the device |
| White screen | Check that `start_url` in manifest matches your admin route |
