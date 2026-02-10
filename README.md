# SBOM Artifact Verifier (Browser‑Only)

## Overview
SBOM Artifact Verifier is a client‑side (in‑browser) tool for validating a 
signed software package (ZIP) against its SBOM (Software Bill of Materials).
No data leaves your machine: all processing happens locally in your browser.

## What it does
- Accepts an OEM or End‑User package ZIP (password‑protected ZIPs supported).
- Locates the SBOM under `/_manifest/spdx_2.2/manifest.spdx.json`.
- Verifies SBOM integrity by comparing the SBOM to `manifest.spdx.json.sha256`.
- Verifies catalog signatures (`.cat`) using WebCrypto + PKI.js:
  - Driver catalog (outside `/_manifest/`) when present.
  - SBOM catalog under `/_manifest/`.
  - Displays the signer (subject), issuer, and a best‑effort root.
- Recomputes SHA‑256 for every file and compares with the SBOM:
  - Flags OK, TAMPERED (mismatch), MISSING (in SBOM but not in ZIP), and EXTRA (in ZIP but not in SBOM).
- Presents an Archive Tree and a detailed results table.

## What it does not do
- It does not consult the OS trust store (e.g., Windows WinVerifyTrust) and 
  does not perform revocation/OCSP checks. For official Windows trust of driver 
  catalogs use: `signtool verify /kp /v <catalog.cat>`.
- It does not upload files anywhere. If your browser blocks the third‑party 
  module CDNs, you can vendor dependencies locally.

## How to use
1. Open the HTML page (e.g., via GitHub Pages or locally).
2. Drag & drop your package ZIP, or click the label to select a file.
3. If the ZIP is password‑protected, enter the password in the dialog.
4. Review the Signature & Integrity results first, then the file tree/table.

## Dependencies (loaded dynamically)
- JSZip: basic ZIP parsing.
- zip.js: only used for password‑protected ZIPs.
- asn1js + PKI.js: PKCS#7/CMS parsing and cryptographic verification of `.cat`.

## Offline Use (vendor deps)
- Place libraries under `vendor/` to avoid CDNs:
  - `vendor/jszip/jszip.min.js`
  - `vendor/zip.js/zip.min.js` or `vendor/zip.js/zip.js` (ESM); optional `vendor/zip.js/zip-full.min.js` (UMD)
  - `vendor/asn1js/asn1js.min.js` and `vendor/pkijs/pkijs.min.js` (ESM)
- The app prefers vendor ESM first, then CDN ESM, then UMD fallbacks.
- If network is blocked and vendor files are missing, loaders will show an error.

## Deployment
The page is static (HTML/JS/CSS) and can be hosted on GitHub Pages. For example:
https://verifier.belcarra.com

## Repository
GitHub: https://github.com/Belcarra/sbom_artifact_verifier

## Security & Privacy
All processing and cryptographic checks happen locally in the browser tab. 
No files or passwords are sent to any server.
