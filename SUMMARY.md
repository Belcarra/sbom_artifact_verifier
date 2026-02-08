# SUMMARY (Context for follow‑on work)

## Purpose
A browser‑only SBOM Artifact Verifier that:
- Validates a package ZIP against its SBOM (SPDX 2.2 JSON).
- Verifies SBOM integrity (manifest vs .sha256).
- Verifies catalog signatures (`.cat`) cryptographically (PKCS#7/CMS) and shows signer/issuer/root.
- Recomputes SHA‑256 for each file and compares with SBOM to flag OK/TAMPERED/MISSING/EXTRA.
- Supports password‑protected ZIPs.
- Performs all processing locally (no uploads).

## Current features
- Drag & Drop UI + clickable label; password modal with show/hide toggle.
- Signature & Integrity panel shown first:
  - SBOM Catalog Signature (under `/_manifest/.../manifest.spdx.json.cat`)
  - SBOM Integrity (SBOM vs `.sha256`)
  - Driver Catalog Signature (driver `.cat` outside `_manifest` when present)
- Archive Contents text tree with box‑drawing characters and inline status badges.
- Full results table (bottom) listing all file statuses.
- “New File” button resets to the opening screen.
- Robust loaders with CDN fallbacks:
  - JSZip for normal ZIPs
  - zip.js for password‑protected ZIPs (ESM + UMD fallback)
  - asn1js + PKI.js for CMS verification (ESM with CDN fallbacks)

## Limitations / non‑goals (by design)
- No OS trust store (WinVerifyTrust) or revocation checks. For official trust, use `signtool verify /kp /v` externally.
- SBOM schema syntax validation is out of scope (focus is SBOM↔artifact linkage & signatures).

## Files to move to the new repo
- `validator/index.html` (landing/redirect)
- `validator/spdxsbom.html` (full app)
- `validator/README.md` (public overview)
- `validator/TODO.md` (work plan)
- (optional) vendor/ copies of JS libs

## Tech notes / decisions
- All logic is plain HTML/CSS/JS; no build step required.
- Dynamic imports used for portability; plan is to vendor and prefer local files.
- Password ZIPs are handled via zip.js; a JSZip failure triggers the password flow.
- Catalog verification uses PKI.js; signer cert is found by SID (Issuer+Serial or SKI).
- UI removes auto‑scrolling to keep the status & signature results in view.

## Next work (high‑level)
- Vendor third‑party libraries and remove CDN reliance.
- Two‑column layout and table filters for large screens.
- Signature chain “details” drawer and optional pinned roots notice.
- Export JSON/CSV, collapsible tree folders, aggregate directory badges.
- Add CSP and improve accessibility.

