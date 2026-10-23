const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
test('Pages build preserves verifier bytes and only publishes linked assets',()=>{
    execFileSync(process.execPath,['tools/build-pages.cjs'],{cwd:root});
    const publicDir=path.join(root,'dist/public');
    assert.deepEqual(fs.readFileSync(path.join(publicDir,'spdxsbom.html')),fs.readFileSync(path.join(root,'spdxsbom.html')));
    assert.match(fs.readFileSync(path.join(publicDir,'_headers'),'utf8'),/Cache-Control: no-cache, no-transform/);
    assert.ok(fs.readFileSync(path.join(publicDir,'belcarra/index.html'),'utf8').includes('<h1>Belcarra SPDX SBOM Overview</h1>'));
    for(const name of ['package.json','cloudflare.env','test','scripts','artifacts','belcarra/kit/drivers','belcarra/oem/belcarra.cfg']) assert.ok(!fs.existsSync(path.join(publicDir,name)),name);
    const html=fs.readFileSync(path.join(publicDir,'belcarra/index.html'),'utf8');
    for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
        if (/^https?:/.test(match[1])) continue;
        assert.ok(fs.existsSync(path.resolve(publicDir,'belcarra',match[1])),match[1]);
    }
});
test('Index preserves OEM handoff hash and query when opening verifier',async()=>{
    const browser=await chromium.launch();
    try {
        const page=await browser.newPage();
        await page.route('https://preview.test/**',route=>route.fulfill({contentType:'text/html',body:route.request().url().includes('spdxsbom.html')?'<h1>Verifier</h1>':fs.readFileSync(path.join(root,'index.html'),'utf8')}));
        await page.goto('https://preview.test/?test=1#receive');
        await page.waitForURL('https://preview.test/spdxsbom.html?test=1#receive');
        assert.equal(await page.getByRole('heading').textContent(),'Verifier');
    } finally {await browser.close();}
});
