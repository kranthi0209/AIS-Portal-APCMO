/* ============================================================
 *  upload_mlc_photos.js
 *  Downloads each AP MLC photo from aplegislature.org and uploads it to
 *  Supabase Storage at:  officer-photos/mlcs/<mlc_id>.jpg
 *  (same bucket as IAS/MLAs/MPs), matching photo_url in mlcs_seed.sql.
 *
 *  PREREQ:  Node 18+  (uses global fetch)
 *  RUN:
 *     # PowerShell:
 *     $env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Zm15ZWxlbGFjb3Nkd3F5eG9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxMDM1OCwiZXhwIjoyMDkxNTg2MzU4fQ._BCrqFCKeKAUpJncyyPXfr46JJVr71o4Tvb74B86pRU"; node upload_mlc_photos.js
 *     # bash:
 *     SUPABASE_SERVICE_KEY="<your service_role key>" node upload_mlc_photos.js
 *
 *  The SERVICE ROLE key is required (Storage writes are blocked for anon).
 *  Get it from Supabase → Project Settings → API.  (Do NOT commit the key.)
 * ============================================================ */
const fs = require('fs');

const SUPABASE_URL = 'https://hzfmyelelacosdwqyxos.supabase.co';
const BUCKET       = 'officer-photos';
const FOLDER       = 'mlcs';
const CONCURRENCY  = 5;
const KEY = process.env.SUPABASE_SERVICE_KEY;

if (!KEY) {
  console.error('\n  Missing SUPABASE_SERVICE_KEY env var (service_role key).\n  PowerShell:  $env:SUPABASE_SERVICE_KEY="..."; node upload_mlc_photos.js\n');
  process.exit(1);
}

function parseCSV(text){
  text = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const rows=[]; let row=[], field='', inQ=false;
  for (let i=0;i<text.length;i++){ const c=text[i];
    if (inQ){ if (c==='"'){ if (text[i+1]==='"'){ field+='"'; i++; } else inQ=false; } else field+=c; }
    else { if (c==='"') inQ=true; else if (c===','){ row.push(field); field=''; }
      else if (c==='\n'){ row.push(field); rows.push(row); row=[]; field=''; } else field+=c; } }
  if (field.length||row.length){ row.push(field); rows.push(row); }
  return rows.filter(r=>r.length>1);
}

const rows = parseCSV(fs.readFileSync('AP_Legislative_Council_MLCs.csv','utf8'));
rows.shift(); // header
const items = rows.map(r => ({ id: String(r[0]||'').trim(), src: String(r[22]||'').trim(), name: r[1] }))
                  .filter(x => x.id && x.src);

console.log('MLC photos to process:', items.length);

async function one(it){
  try {
    const resp = await fetch(it.src, { redirect:'follow' });
    if (!resp.ok) throw new Error('download HTTP ' + resp.status);
    const ct = resp.headers.get('content-type') || '';
    const buf = Buffer.from(await resp.arrayBuffer());
    if (!/image\//i.test(ct) && buf.length < 1000) throw new Error('not an image (ct=' + ct + ', ' + buf.length + 'b)');
    const path = FOLDER + '/' + it.id + '.jpg';
    const up = await fetch(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method:'POST',
      headers:{ 'Authorization':'Bearer '+KEY, 'Content-Type': ct.startsWith('image/') ? ct : 'image/jpeg', 'x-upsert':'true' },
      body: buf
    });
    if (!up.ok) throw new Error('upload HTTP ' + up.status + ' ' + (await up.text()).slice(0,120));
    return { id: it.id, ok:true };
  } catch(e){ return { id: it.id, ok:false, err: e.message, name: it.name }; }
}

(async () => {
  let done=0, ok=0; const fails=[];
  for (let i=0;i<items.length;i+=CONCURRENCY){
    const batch = items.slice(i, i+CONCURRENCY);
    const res = await Promise.all(batch.map(one));
    res.forEach(r => { done++; if (r.ok) ok++; else fails.push(r); });
    process.stdout.write('\r  ' + done + '/' + items.length + '  (ok: ' + ok + ', failed: ' + fails.length + ')   ');
  }
  console.log('\n\nDone. Uploaded ' + ok + ' / ' + items.length + '.');
  if (fails.length){
    console.log('Failed (' + fails.length + '):');
    fails.forEach(f => console.log('  - ' + f.id + '  ' + (f.name||'') + '  →  ' + f.err));
  }
})();
