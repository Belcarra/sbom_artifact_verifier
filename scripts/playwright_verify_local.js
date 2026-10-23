#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
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
  process.argv[4] || path.resolve(repoRoot, "artifacts", "playwright-local-verifier.png");

if (!fs.existsSync(zipPath)) {
  console.error(`ZIP not found: ${zipPath}`);
  process.exit(2);
}

function mimeType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relPath = urlPath === "/" ? "/spdxsbom.html" : urlPath;
    const normalized = path.normalize(relPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(rootDir, normalized);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mimeType(filePath) });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  const server = await startStaticServer(repoRoot);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/spdxsbom.html`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const fileInput = page.locator("#file-input");
    await fileInput.setInputFiles(zipPath);

    const passwordModal = page.locator("#pwd-modal");
    await passwordModal.waitFor({ state: "visible", timeout: 15000 });
    await page.locator("#pwd-input").fill(zipPassword);
    await page.locator("#pwd-ok").click();

    await page.locator("#status-box").waitFor({ state: "visible", timeout: 30000 });
    await page.locator("#results-table").waitFor({ state: "visible", timeout: 30000 });

    await page.waitForFunction(() => {
      const sbom = document.querySelector("#sbom-status");
      const sbomCat = document.querySelector("#sbom-cat-status");
      const driverCat = document.querySelector("#cat-status");
      return !!sbom && !!sbomCat && !!driverCat &&
        sbom.textContent !== "Pending" &&
        sbomCat.textContent !== "Pending" &&
        driverCat.textContent !== "Pending";
    }, { timeout: 30000 });

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
      }, { timeout: 30000 });
      await page.waitForFunction(() => {
        const sbom = document.querySelector("#sbom-status");
        const sbomCat = document.querySelector("#sbom-cat-status");
        return !!sbom && !!sbomCat &&
          sbom.textContent !== "Pending" &&
          sbomCat.textContent !== "Pending";
      }, { timeout: 30000 });

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
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
