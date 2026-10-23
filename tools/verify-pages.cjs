const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const origin=new URL(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync('dist/manifest.json','utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function main() {
    for (const name of ['index.html','spdxsbom.html','belcarra/index.html','belcarra/Belcarra-SPDX-SBOM.pdf']) {
        const expected=manifest.files.find(f=>f.path===name);
        const response=await fetch(new URL(name+'?deploy-check='+Date.now(),origin),{signal:AbortSignal.timeout(20000)});
        assert.equal(response.status,200,name);
        let bytes=Buffer.from(await response.arrayBuffer());
        if (name.endsWith('.html')) bytes=Buffer.from(bytes.toString().replace(/<script[^>]*src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*><\/script>\n?/g,''));
        assert.equal(hash(bytes),expected.sha256,name+' differs from build');
    }
    for (const name of ['cloudflare.env','package.json','scripts/release_zip_to_pdf.js','artifacts/private.txt','test/example.zip']) {
        const response=await fetch(new URL(name,origin));
        await response.arrayBuffer();
        assert.equal(response.status,404,name);
    }
    console.log('Verified site assets, example report and local-file exclusions at '+origin.origin);
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
