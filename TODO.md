# TODO for sbom_artifact_verifier

## 1) Make it 100% offline (vendor deps)
- Vendor dependencies locally and prefer them over CDNs:
  - `vendor/jszip/jszip.min.js` (ZIP reading)
  - `vendor/zip.js/zip-full.min.js` (password‑protected ZIPs, UMD)
  - `vendor/asn1js/asn1js.min.js` and `vendor/pkijs/pkijs.min.js` (CMS/PKCS#7)
- Adjust loaders to try vendor first, then CDN ESM, then UMD fallback.
- If any CDN fallbacks remain, add SRI and document the policy.

## 2) Pages/hosting
- New public repo: `Belcarra/sbom_artifact_verifier` with:
  - `index.html` (landing/redirect), `spdxsbom.html`, `README.md`
  - (optional) `vendor/` folder with the above libs
  - GitHub Pages enabled from root or a `docs/` folder
  - (optional) `.github/workflows/pages.yml` for auto‑publish

## 3) Signature details
- Add a collapsible “details” block under each catalog result to show:
  - Signer subject CN, issuer CN, discovered root CN
  - EKUs (Code Signing), validity dates
  - Timestamp countersignature (RFC3161) info when present
- Optional “pinned roots” display (e.g., DigiCert/Microsoft) with a clear note that
  this is NOT OS trust.

## 4) UI/UX polish
- Two‑column layout for ultrawide screens: left (Archive Tree + legend), right (Table)
- Collapsible directories in the Archive Tree
- Folder badges = aggregate worst child (TAMPERED > MISSING > EXTRA > OK)
- Results table improvements: filters (OK/TAMPERED/MISSING/EXTRA), search by path,
  sticky header, zebra rows, copy row/path actions
- Dark mode & high‑contrast badge palette
- Accessibility: ARIA roles, focus management, keyboard navigation

## 5) Reports & export
- Export JSON (similar to `sbom-tool validate -o`) with:
  - Integrity results, signature results (signer/issuer/root)
  - Per‑file statuses and counts
- Export archive tree as text (box‑drawing) and CSV of table results

## 6) Password UX
- Remember password for the current session to support nested ZIPs
- Add a “Paste from clipboard” hint; keep “Show/Hide password” toggle

## 7) Security & CSP
- Add a strict CSP for GitHub Pages (once vendored)
- Remove dynamic imports when vendor is present to reduce surface area

## 8) QA / samples
- Public test corpus with:
  - All‑OK package
  - TAMPERED file
  - MISSING file
  - EXTRA file
  - Signed vs unsigned catalogs
- Document limitations prominently (no OS trust store, no revocation checks)

