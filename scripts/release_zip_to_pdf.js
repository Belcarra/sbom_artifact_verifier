#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const repoRoot = path.resolve(__dirname, "..");

function usage() {
  console.error(
    [
      "Usage: release_zip_to_pdf.js [options] <release.zip> [more.zip ...]",
      "",
      "Options:",
      "  --password <password>     Password for encrypted OEM ZIPs",
      "  --output <file.pdf>       Output PDF path; only valid with one ZIP",
      "  --output-dir <dir>        Directory for generated PDFs",
      "  --verifier <url>          Verifier HTML URL; default: local spdxsbom.html",
      "  --no-nested              Do not include nested driver ZIP verification page",
      "  --help                   Show this help",
      "",
      "Default output is next to each ZIP as <zip-stem>.pdf.",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const args = {
    password: "",
    output: "",
    outputDir: "",
    verifier: "",
    includeNested: true,
    zips: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else if (arg === "--password") {
      args.password = argv[++i] || "";
    } else if (arg === "--output") {
      args.output = argv[++i] || "";
    } else if (arg === "--output-dir") {
      args.outputDir = argv[++i] || "";
    } else if (arg === "--verifier") {
      args.verifier = argv[++i] || "";
    } else if (arg === "--no-nested") {
      args.includeNested = false;
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      args.zips.push(arg);
    }
  }

  if (!args.zips.length) throw new Error("No release ZIP specified.");
  if (args.output && args.zips.length !== 1) {
    throw new Error("--output can only be used with one ZIP.");
  }
  return args;
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

async function maybeEnterPassword(page, password, zipPath) {
  const modal = page.locator("#pwd-modal");
  const visible = await modal.isVisible({ timeout: 1500 }).catch(() => false);
  if (!visible) return;
  if (!password) {
    throw new Error(`ZIP is password protected; pass --password for ${zipPath}`);
  }
  await page.locator("#pwd-input").fill(password);
  await page.locator("#pwd-ok").click();
}

async function waitForVerification(page) {
  await page.locator("#status-box").waitFor({ state: "visible", timeout: 45000 });
  await page.locator("#results-table").waitFor({ state: "visible", timeout: 45000 });
  await page.locator("#save-pdf-btn").waitFor({ state: "visible", timeout: 45000 });
  await page.waitForFunction(() => {
    const sbom = document.querySelector("#sbom-status");
    const sbomCat = document.querySelector("#sbom-cat-status");
    return !!sbom && !!sbomCat &&
      sbom.textContent !== "Pending" &&
      sbomCat.textContent !== "Pending";
  }, { timeout: 45000 });

  const failed = await page.locator("#status-box.error").count();
  if (failed) {
    const text = (await page.locator("#status-box").textContent()) || "verification failed";
    throw new Error(text.trim());
  }
}

async function openReportPage(page) {
  const [report] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator("#save-pdf-btn").click(),
  ]);
  await report.waitForLoadState("domcontentloaded");
  await report.locator("text=Belcarra SBOM Verification Report").waitFor({ timeout: 15000 });
  return report;
}

async function saveCurrentReport(page, outputPath) {
  const report = await openReportPage(page);
  try {
    await report.emulateMedia({ media: "print" });
    await report.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });
  } finally {
    await report.close().catch(() => {});
  }
}

function outputPathFor(zipPath, args) {
  if (args.output) return path.resolve(args.output);
  const base = `${path.basename(zipPath, path.extname(zipPath))}.pdf`;
  const dir = args.outputDir ? path.resolve(args.outputDir) : path.dirname(zipPath);
  return path.join(dir, base);
}

async function generatePdf(browser, verifierUrl, zipPath, args) {
  const outputPath = outputPathFor(zipPath, args);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
  try {
    await page.goto(verifierUrl, { waitUntil: "networkidle" });
    await page.locator("#file-input").setInputFiles(zipPath);
    await maybeEnterPassword(page, args.password, zipPath);
    await waitForVerification(page);
    await saveCurrentReport(page, outputPath);

    let nestedOutput = "";
    const hasNested = await page.locator("#dep-zip-link").count();
    if (args.includeNested && hasNested) {
      const nestedPath = outputPath.replace(/\.pdf$/i, "-drivers.pdf");
      const previousTrail = await page.locator('#package-trail').textContent();
      await page.locator("#dep-zip-link").click();
      await page.waitForFunction(previous => {
        const trail = document.querySelector('#package-trail')?.textContent || '';
        return trail !== previous && /Nested:/i.test(trail);
      }, previousTrail, { timeout: 30000 });
      await waitForVerification(page);
      await saveCurrentReport(page, nestedPath);
      nestedOutput = nestedPath;
    }

    return { zipPath, outputPath, nestedOutput };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const missing = args.zips.map(z => path.resolve(z)).filter(z => !fs.existsSync(z));
  if (missing.length) throw new Error(`ZIP not found: ${missing.join(", ")}`);

  let server = null;
  let verifierUrl = args.verifier;
  if (!verifierUrl) {
    server = await startStaticServer(repoRoot);
    const address = server.address();
    verifierUrl = `http://127.0.0.1:${address.port}/spdxsbom.html`;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const zipArg of args.zips) {
      const zipPath = path.resolve(zipArg);
      const result = await generatePdf(browser, verifierUrl, zipPath, args);
      console.log(`[PDF] ${result.zipPath} -> ${result.outputPath}`);
      if (result.nestedOutput) console.log(`[PDF] nested drivers -> ${result.nestedOutput}`);
    }
  } finally {
    await browser.close().catch(() => {});
    if (server) await new Promise(resolve => server.close(resolve));
  }
}

main().catch(err => {
  console.error(`[ERROR] ${err.message || err}`);
  process.exit(1);
});
