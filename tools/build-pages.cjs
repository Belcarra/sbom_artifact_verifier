const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const markdown = require('markdown-it')({html:false});

const root = path.resolve(__dirname,'..');
const out = path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});
const files=[];
function publish(name,bytes) {
    const target=path.join(out,'public',name);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,bytes);
    files.push({path:name,bytes:Buffer.byteLength(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
// No recursive repository upload: publish only linked website assets.
const inputs=['index.html','spdxsbom.html','404.html','_headers',
    'belcarra/Belcarra-SPDX-SBOM.pdf','belcarra/index.pdf',
    'belcarra/report-kit.json','belcarra/report-oem.json',
    ...['kit','oem'].map(kind=>`belcarra/${kind}/_manifest/spdx_2.2/manifest.spdx.json`),
    ...['belcarra-verifier.png','belcarra-verifier-password.png','belcarra-verifier-oem.png','belcarra-verifier-kit.png'].map(name=>'belcarra/imgs/'+name)];
for (const name of inputs) publish(name,fs.readFileSync(path.join(root,name)));
for (const name of ['index','Belcarra-SPDX-SBOM']) {
    const source=fs.readFileSync(path.join(root,'belcarra',name+'.md'),'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
    publish('belcarra/'+name+'.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Belcarra SPDX SBOM Overview</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:1050px;margin:32px auto;padding:0 20px;color:#222}img{max-width:100%;height:auto}pre,table{display:block;max-width:100%;overflow:auto}pre{background:#f4f7f6;padding:16px}td,th{padding:6px 12px;border:1px solid #ccd3dc}table{border-collapse:collapse}a{color:#065fb5}</style></head><body>${markdown.render(source)}</body></html>`);
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),files},null,2)+'\n');
console.log(`Built ${files.length} public assets into dist/public`);
