#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const repoRoot = path.resolve(__dirname, "..");
const defaultZip = path.resolve(
  repoRoot,
  "..",
  "usblan-kits",
  "kits",
  "belcarra",
  "02-05-02-053-Beta-chk",
  "belcarra-02-05-02-053-Beta-chk-amd64_arm64.zip",
);

const zipPath = path.resolve(process.argv[2] || defaultZip);
const zipPassword = process.argv[3] || "belcarra";
const screenshotPath =
  process.argv[4] || path.resolve(repoRoot, "artifacts", "playwright-live-verifier.png");
const verifierUrl = process.argv[5] || "https://verifier.belcarra.com";

if (process.argv[2] === "-h" || process.argv[2] === "--help") {
  console.log(
    "Usage: playwright_verify_live.js [zip-path] [zip-password] [screenshot-path] [verifier-url]",
  );
  process.exit(0);
}

if (!fs.existsSync(zipPath)) {
  console.error(`ZIP not found: ${zipPath}`);
  process.exit(2);
}

async function main() {
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

  try {
    await page.goto(verifierUrl, { waitUntil: "networkidle", timeout: 60000 });

    const fileInput = page.locator("#file-input");
    await fileInput.setInputFiles(zipPath);

    const passwordModal = page.locator("#pwd-modal");
    await passwordModal.waitFor({ state: "visible", timeout: 20000 });
    await page.locator("#pwd-input").fill(zipPassword);
    await page.locator("#pwd-ok").click();

    await page.locator("#status-box").waitFor({ state: "visible", timeout: 60000 });
    await page.locator("#results-table").waitFor({ state: "visible", timeout: 60000 });

    await page.waitForFunction(() => {
      const sbom = document.querySelector("#sbom-status");
      const sbomCat = document.querySelector("#sbom-cat-status");
      const driverCat = document.querySelector("#cat-status");
      return !!sbom && !!sbomCat && !!driverCat &&
        sbom.textContent !== "Pending" &&
        sbomCat.textContent !== "Pending" &&
        driverCat.textContent !== "Pending";
    }, { timeout: 60000 });

    const rows = await page.$$eval("#results-body tr", trs =>
      trs.map(tr => {
        const tds = [...tr.querySelectorAll("td")].map(td => (td.textContent || "").trim());
        return { path: tds[0] || "", hash: tds[1] || "", status: tds[2] || "" };
      }),
    );

    const extras = rows.filter(r => /EXTRA/i.test(r.status));
    const missing = rows.filter(r => /MISSING/i.test(r.status));
    const tampered = rows.filter(r => /TAMPERED/i.test(r.status));

    const summary = {
      url: verifierUrl,
      title: await page.title(),
      statusBox: (await page.locator("#status-box").textContent())?.trim(),
      sbomCatalog: (await page.locator("#sbom-cat-status").textContent())?.trim(),
      sbomIntegrity: (await page.locator("#sbom-status").textContent())?.trim(),
      driverCatalog: (await page.locator("#cat-status").textContent())?.trim(),
      extras: extras.map(r => r.path),
      missing: missing.map(r => r.path),
      tampered: tampered.map(r => r.path),
      dependencyLinkVisible: await page.locator("#dep-zip-link").count() > 0,
    };

    if (summary.dependencyLinkVisible) {
      await page.locator("#dep-zip-link").click();
      await page.waitForFunction(() => {
        const trail = document.querySelector("#package-trail");
        return !!trail && /drivers\.zip/i.test(trail.textContent || "");
      }, { timeout: 60000 });
      await page.waitForFunction(() => {
        const sbom = document.querySelector("#sbom-status");
        const sbomCat = document.querySelector("#sbom-cat-status");
        return !!sbom && !!sbomCat &&
          sbom.textContent !== "Pending" &&
          sbomCat.textContent !== "Pending";
      }, { timeout: 60000 });

      const nestedRows = await page.$$eval("#results-body tr", trs =>
        trs.map(tr => {
          const tds = [...tr.querySelectorAll("td")].map(td => (td.textContent || "").trim());
          return { path: tds[0] || "", status: tds[2] || "" };
        }),
      );
      const nestedExtras = nestedRows.filter(r => /EXTRA/i.test(r.status));
      const nestedMissing = nestedRows.filter(r => /MISSING/i.test(r.status));
      const nestedTampered = nestedRows.filter(r => /TAMPERED/i.test(r.status));

      summary.nested = {
        statusBox: (await page.locator("#status-box").textContent())?.trim(),
        sbomCatalog: (await page.locator("#sbom-cat-status").textContent())?.trim(),
        sbomIntegrity: (await page.locator("#sbom-status").textContent())?.trim(),
        driverCatalog: (await page.locator("#cat-status").textContent())?.trim(),
        extras: nestedExtras.map(r => r.path),
        missing: nestedMissing.map(r => r.path),
        tampered: nestedTampered.map(r => r.path),
      };
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(JSON.stringify(summary, null, 2));

    const topLevelFailed = summary.extras.length || summary.missing.length || summary.tampered.length;
    const nestedFailed = summary.nested &&
      (summary.nested.extras.length || summary.nested.missing.length || summary.nested.tampered.length);
    if (topLevelFailed || nestedFailed) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
