# Cloudflare Pages Deployment

The verifier is served at `https://verifier.belcarra.com` from the
`belcarra-verifier` Pages project. Verification still runs in the visitor's
browser; hosting does not receive uploaded ZIPs or ZIP passwords.

Push to `develop` to run the GitHub Actions test, build and deployment workflow.
The repository secrets `CLOUDFLARE_API_TOKEN` (Pages Edit) and
`CLOUDFLARE_ACCOUNT_ID` authorize deployment. Do not commit tokens.

Use Node 22 or newer:

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run deploy:pages
node tools/verify-pages.cjs https://verifier.belcarra.com/
```

Only the build's explicit website assets enter `dist/public`. Markdown example
pages are rendered during the build. Local test ZIPs, logs, scripts, node_modules
and OEM configuration are excluded. The build manifest stays outside the
public directory. `CNAME` is retained for history; Cloudflare owns the active
custom-domain configuration.

Before a DNS change, test the Pages preview with a signed OEM ZIP and nested
driver ZIP, archive handoff, provenance and report generation. Preserve the
existing hostname and `#receive` behavior. GitHub Pages can be re-enabled and
the previous DNS CNAME restored for rollback if required.
