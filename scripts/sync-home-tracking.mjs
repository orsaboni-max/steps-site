import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const file=new URL('index.html',root),source=fs.readFileSync(new URL('tracking.js',root),'utf8').replace(/\r\n/g,'\n').trimEnd();
if(/<\/script/i.test(source))throw new Error('Tracking source cannot contain an HTML script closing tag');
const html=fs.readFileSync(file,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n';
const inline=['<!-- Inline tracking.js removes a render-blocking request. Sync: node scripts/sync-home-tracking.mjs -->','<script data-ga data-tracking-inline>',source,'</script>'].join('\n').replace(/\n/g,newline);
const pattern=/<script src="tracking\.js" data-ga><\/script>|<!-- Inline tracking\.js removes a render-blocking request\. Sync: node scripts\/sync-home-tracking\.mjs -->\r?\n<script data-ga data-tracking-inline>[\s\S]*?<\/script>/g;
if([...html.matchAll(pattern)].length!==1)throw new Error('Expected exactly one home tracking bootstrap');
fs.writeFileSync(file,html.replace(pattern,inline));
