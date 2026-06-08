const fs = require('fs');
let ok = true;
function rep(file, name, f, r) {
  let s = fs.readFileSync(file, 'utf8');
  const c = s.split(f).length - 1;
  if (c !== 1) { console.log('BAD(' + c + '):', file, name); ok = false; return; }
  s = s.replace(f, r); fs.writeFileSync(file, s); console.log('OK:', file, name);
}

// 1) admin.html — saffron theme override + hide the top-nav when embedded
rep('admin.html', 'theme+embed',
`  <link rel="stylesheet" href="responsive_fit.css">
</head>`,
`  <link rel="stylesheet" href="responsive_fit.css">
  <script>(function(){ try { if (new URLSearchParams(location.search).get('embed')==='1') document.documentElement.classList.add('ais-embed'); } catch(e){} })();</script>
  <style>
    /* ── AP-CTPTS saffron theme override ── */
    html.ais-embed .top-nav { display:none !important; }
    body { background:#f3ddbb !important; }
    .top-nav { background:linear-gradient(135deg,#6d2410,#9a3412) !important; box-shadow:0 2px 10px rgba(40,15,2,0.4) !important; }
    .top-nav .brand span { color:#fde68a !important; }
    .nav-user { color:#fde68a !important; }
    .btn-nav { background:rgba(255,255,255,0.14) !important; border-color:rgba(253,230,138,0.45) !important; }
    .btn-nav:hover { background:rgba(255,255,255,0.26) !important; }
    .tab-bar { background:#fffdf7 !important; border-bottom-color:#e7c690 !important; }
    .tab-btn:hover { color:#c2410c !important; }
    .tab-btn.active { color:#c2410c !important; border-bottom-color:#c2410c !important; }
    .stat-card { border-color:#f0d6a0 !important; box-shadow:0 1px 6px rgba(120,53,15,0.12) !important; }
    .stat-card .value { color:#7c2d12 !important; }
    .section-card { border-color:#f0d6a0 !important; box-shadow:0 1px 6px rgba(120,53,15,0.12) !important; }
    .section-header { background:linear-gradient(135deg,#fff3d6,#fde7bd) !important; border-bottom-color:#f0d6a0 !important; }
    .section-header h3 { color:#7c2d12 !important; }
    .btn-primary { background:linear-gradient(135deg,#c2410c,#9a3412) !important; }
    .map-sel-opt:hover { background:#fff3d6 !important; color:#c2410c !important; }
    .map-sel-opt.selected { background:#fde7bd !important; color:#9a3412 !important; }
  </style>
</head>`);

// 2) 360_live.html — remove "Open in new tab" from the Admin Console bar
rep('360_live.html', 'open-new-tab',
`        <button class="ac-open-new" onclick="window.open('admin.html','_blank')">Open in new tab &#8599;</button>
`,
``);

if (!ok) { console.log('\n*** SOME FAILED ***'); process.exit(1); }
console.log('\nALL OK');
