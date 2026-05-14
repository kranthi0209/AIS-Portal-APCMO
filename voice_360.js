// ================================================================
// voice_360.js  —  Alkra Text Chatbot for AIS 360° View
//
// Click the 🤖 ALKRA button (bottom-right) to open the chat.
// Type a command and press Enter or click ↩.
// Alkra parses the text and applies filters/sorting instantly.
//
// Example commands:
//   sort by CMO score descending
//   batch 1990 to 2000
//   retiring 2026 to 2028
//   show IPS officers
//   filter by Principal Secretary
//   search Kumar
//   reset
// ================================================================

(function () {
  'use strict';

  var SR        = window.SpeechRecognition || window.webkitSpeechRecognition;
  var SS        = window.speechSynthesis   || null;
  var isOpen    = false;
  var micRec    = null;
  var micActive = false;
  var wakeRec   = null;
  var wakeActive = false;

  // ── Robot SVG icon ───────────────────────────────────────────
  // Inspired by the round-headed robot with cyan ear cups, dark face plate,
  // glowing rectangular eyes, dome body, and antenna.
  // Animation groups reuse the same CSS class names:
  //   cat-ear-l/r  → cyan ear cups (tilt when listening, pivot 26,33 / 74,33)
  //   cat-eye-l/r  → eye windows  (blink scaleY, pivot 35,50 / 65,50)
  //   cat-wl/wr    → arms         (wave rotate±9°, pivot 42,69 / 58,69)
  var CAT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" style="display:block">' +

    // ── Ground shadow ─────────────────────────────────────────────
    '<ellipse cx="50" cy="94" rx="19" ry="3.5" fill="#4a5568" opacity="0.2"/>' +

    // ── Antenna stems (drawn first, behind everything) ─────────────
    '<line x1="43" y1="20" x2="40" y2="9"  stroke="#1a2f5a" stroke-width="2.5" stroke-linecap="round"/>' +
    '<line x1="57" y1="20" x2="60" y2="9"  stroke="#1a2f5a" stroke-width="2.5" stroke-linecap="round"/>' +

    // ── Left arm  (cat-wl, CSS pivot 42,69) ───────────────────────
    // Arm extends left from shoulder joint at ~(42,69); rotates ±9° when typing
    '<g class="cat-wl">' +
      '<ellipse cx="27" cy="72" rx="12" ry="9"   fill="#8fa0cc"/>' +
      '<ellipse cx="25" cy="67" rx="6"  ry="4"   fill="#b8c5e2" opacity="0.72"/>' +
      '<line x1="18" y1="69" x2="22" y2="66" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
      '<line x1="17" y1="74" x2="21" y2="74" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
      '<line x1="18" y1="79" x2="22" y2="81" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
    '</g>' +

    // ── Right arm  (cat-wr, CSS pivot 58,69) ──────────────────────
    '<g class="cat-wr">' +
      '<ellipse cx="73" cy="72" rx="12" ry="9"   fill="#8fa0cc"/>' +
      '<ellipse cx="75" cy="67" rx="6"  ry="4"   fill="#b8c5e2" opacity="0.72"/>' +
      '<line x1="82" y1="69" x2="78" y2="66" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
      '<line x1="83" y1="74" x2="79" y2="74" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
      '<line x1="82" y1="79" x2="78" y2="81" stroke="#5a6fa0" stroke-width="1.7" stroke-linecap="round"/>' +
    '</g>' +

    // ── Body ──────────────────────────────────────────────────────
    '<ellipse cx="50" cy="79" rx="21" ry="16" fill="#bdc8e8"/>' +
    '<ellipse cx="43" cy="70" rx="9"  ry="6"  fill="white"   opacity="0.26"/>' +
    '<ellipse cx="50" cy="88" rx="16" ry="6"  fill="#7080aa" opacity="0.28"/>' +

    // ── Chest button ──────────────────────────────────────────────
    '<circle cx="50" cy="79" r="9.5" fill="#0d418a"/>' +
    '<circle cx="50" cy="79" r="7.5" fill="#0284c7"/>' +
    '<circle cx="50" cy="79" r="5.5" fill="#22d3ee"/>' +
    '<ellipse cx="47.5" cy="76.5" rx="2.5" ry="1.5" fill="white" opacity="0.45"/>' +

    // ── Left ear cup  (cat-ear-l, CSS pivot 26,33) ────────────────
    // Drawn before head dome → head covers inner half, outer half visible as ear cup
    '<g class="cat-ear-l">' +
      '<circle cx="26" cy="33" r="11"  fill="#0ea5e9"/>' +
      '<circle cx="26" cy="33" r="7.5" fill="#0369a1"/>' +
      '<circle cx="26" cy="33" r="4.5" fill="#7dd3fc"/>' +
      '<ellipse cx="24" cy="30.5" rx="1.6" ry="1" fill="white" opacity="0.55"/>' +
    '</g>' +

    // ── Right ear cup  (cat-ear-r, CSS pivot 74,33) ───────────────
    '<g class="cat-ear-r">' +
      '<circle cx="74" cy="33" r="11"  fill="#0ea5e9"/>' +
      '<circle cx="74" cy="33" r="7.5" fill="#0369a1"/>' +
      '<circle cx="74" cy="33" r="4.5" fill="#7dd3fc"/>' +
      '<ellipse cx="72" cy="30.5" rx="1.6" ry="1" fill="white" opacity="0.55"/>' +
    '</g>' +

    // ── Head dome (covers inner halves of ear cups) ────────────────
    '<ellipse cx="50" cy="37" rx="23" ry="21" fill="#dde3f5"/>' +
    '<ellipse cx="43" cy="26" rx="11" ry="7"  fill="white"   opacity="0.28"/>' +
    '<ellipse cx="50" cy="37" rx="23" ry="21" fill="none" stroke="#aab4d8" stroke-width="1.5" opacity="0.5"/>' +

    // ── Dark face plate ───────────────────────────────────────────
    // rx=19 → spans x 31–69 so both eye windows fit exactly inside
    '<ellipse cx="50" cy="44" rx="19" ry="14" fill="#1a237e"/>' +
    '<ellipse cx="50" cy="36" rx="13" ry="5"  fill="#283593"  opacity="0.55"/>' +
    '<ellipse cx="50" cy="44" rx="19" ry="14" fill="none" stroke="#0d1b55" stroke-width="1.2"/>' +

    // ── Left eye window  (cat-eye-l, CSS pivot 35,50) ─────────────
    // Rect centered at y=50 so catBlink scaleY(0.07) squishes symmetrically
    '<g class="cat-eye-l">' +
      '<rect x="31" y="43" width="12" height="14" rx="3.5" fill="white"   opacity="0.97"/>' +
      '<rect x="33" y="45" width="8"  height="10" rx="2"   fill="#67e8f9" opacity="0.88"/>' +
      '<rect x="35" y="48" width="4"  height="5"  rx="1.5" fill="#0c4a6e"/>' +
      '<circle cx="34" cy="46.5" r="1.5" fill="white" opacity="0.75"/>' +
    '</g>' +

    // ── Right eye window  (cat-eye-r, CSS pivot 65,50) ────────────
    '<g class="cat-eye-r">' +
      '<rect x="57" y="43" width="12" height="14" rx="3.5" fill="white"   opacity="0.97"/>' +
      '<rect x="59" y="45" width="8"  height="10" rx="2"   fill="#67e8f9" opacity="0.88"/>' +
      '<rect x="61" y="48" width="4"  height="5"  rx="1.5" fill="#0c4a6e"/>' +
      '<circle cx="60" cy="46.5" r="1.5" fill="white" opacity="0.75"/>' +
    '</g>' +

    // ── Neck joint ────────────────────────────────────────────────
    '<rect x="44" y="57" width="12" height="8" rx="3" fill="#9fa8da"/>' +
    '<line x1="44" y1="61" x2="56" y2="61" stroke="#7986cb" stroke-width="1.5"/>' +

    // ── Antenna tips (drawn last — front layer) ────────────────────
    '<circle cx="40" cy="8.5" r="3.2" fill="#0ea5e9"/>' +
    '<circle cx="40" cy="8.5" r="1.8" fill="#bae6fd"/>' +
    '<circle cx="60" cy="8.5" r="3.2" fill="#0ea5e9"/>' +
    '<circle cx="60" cy="8.5" r="1.8" fill="#bae6fd"/>' +

    '</svg>';

  // ================================================================
  // COMMAND PARSING
  // ================================================================

  var SORT_KEYS = [
    { terms: ['seniority', 'senior', 'officer id'],                          val: 'seniority'     },
    { terms: ['weighted', 'overall score', 'combined score', 'total score'], val: 'score_weighted' },
    { terms: ['e office', 'eoffice', 'e-office', 'electronic office'],       val: 'score_0'        },
    { terms: ['swarna ap', 'swarna andhra', 'swarna'],                       val: 'score_1'        },
    { terms: ['gsdp', 'gross state domestic product', 'state gdp'],          val: 'score_2'        },
    { terms: ['goi fund', 'government of india fund', 'central fund',
              'central scheme', 'goi scheme', 'goi'],                        val: 'score_3'        },
    { terms: ['public perception', 'public opinion', 'perception'],          val: 'score_4'        },
    { terms: ['innovation', 'innovative'],                                   val: 'score_5'        },
    { terms: ['digitalisation', 'digitalization', 'digitisation',
              'digitization', 'digital'],                                    val: 'score_6'        },
    { terms: ['new policy', 'new policies', 'policy'],                       val: 'score_7'        },
    { terms: ['deregularisation', 'deregularization', 'regularisation',
              'regularization', 'deregular'],                                val: 'score_8'        },
    { terms: ['integrity index', 'integrity'],                               val: 'score_9'        },
    { terms: ['party feedback', 'party rating', 'party'],                    val: 'score_10'       },
    { terms: ['media feedback', 'media rating', 'media'],                    val: 'score_11'       },
    { terms: ['leadership skill', 'leadership'],                             val: 'score_12'       },
    { terms: ['cmo score', 'cmo rating', 'chief minister score', 'cmo'],     val: 'score_13'       },
  ];

  // ── Fuzzy / typo tolerance ────────────────────────────────────
  function levenshtein(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [], curr = [];
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      curr[0] = i;
      for (var jj = 1; jj <= n; jj++) {
        curr[jj] = a[i-1] === b[jj-1]
          ? prev[jj-1]
          : 1 + Math.min(prev[jj], curr[jj-1], prev[jj-1]);
      }
      prev = curr.slice();
    }
    return curr[n];
  }

  // Allowed edits by word length: short acronyms need exact match,
  // longer words get progressively more tolerance.
  function editThreshold(len) {
    if (len <= 4) return 0;   // gsdp, cmo, ias → exact
    if (len <= 7) return 1;   // swarna, media, policy → 1 typo
    return 2;                 // integrity, leadership, perception → 2 typos
  }

  // Returns true if every word in 'phrase' fuzzy-matches at least one
  // word in 'inputText' (within the allowed edit distance).
  function fuzzyPhraseMatch(inputText, phrase) {
    var iWords = inputText.split(/\s+/);
    var pWords = phrase.split(/\s+/);
    return pWords.every(function (pw) {
      if (pw.length <= 2) return inputText.indexOf(pw) !== -1; // short words: exact
      var thr = editThreshold(pw.length);
      return iWords.some(function (iw) {
        return iw.length >= pw.length - thr &&   // avoid matching tiny fragments
               levenshtein(iw, pw) <= thr;
      });
    });
  }

  function matchSortKey(t) {
    // Pass 1 — exact substring (fastest, no false positives)
    for (var i = 0; i < SORT_KEYS.length; i++) {
      var sk = SORT_KEYS[i];
      for (var j = 0; j < sk.terms.length; j++) {
        if (t.indexOf(sk.terms[j]) !== -1) return sk.val;
      }
    }
    // Pass 2 — fuzzy word match (handles typos like "Integrety", "Leedership")
    for (var ii = 0; ii < SORT_KEYS.length; ii++) {
      var sk2 = SORT_KEYS[ii];
      for (var jj = 0; jj < sk2.terms.length; jj++) {
        if (fuzzyPhraseMatch(t, sk2.terms[jj])) return sk2.val;
      }
    }
    return null;
  }

  // Exact substring match first; fuzzy phrase match as fallback when fuzzy=true
  function matchSelectOption(selId, text, fuzzy) {
    var sel = document.getElementById(selId);
    if (!sel) return null;
    var lower = text.toLowerCase();

    // Pass 1 — exact
    var best = null, bestLen = 0;
    for (var i = 0; i < sel.options.length; i++) {
      var opt = sel.options[i];
      if (!opt.value) continue;
      var v = opt.value.toLowerCase();
      if (lower.indexOf(v) !== -1 && v.length > bestLen) { best = opt.value; bestLen = v.length; }
    }
    if (best || !fuzzy) return best;

    // Pass 2 — fuzzy word-by-word (handles "Andra Pardesh" → "Andhra Pradesh")
    var bestF = null, bestFL = 0;
    for (var j = 0; j < sel.options.length; j++) {
      var opt2 = sel.options[j];
      if (!opt2.value || opt2.value.length <= 2) continue;
      var v2 = opt2.value.toLowerCase();
      if (fuzzyPhraseMatch(lower, v2) && v2.length > bestFL) { bestF = opt2.value; bestFL = v2.length; }
    }
    return bestF;
  }

  // True if word starts with stem (exact) or its first stem.length chars fuzzy-match stem
  function wordStartsWith(word, stem) {
    if (word.indexOf(stem) === 0) return true;
    var prefix = word.substring(0, Math.min(word.length, stem.length + 1));
    return levenshtein(prefix, stem) <= (stem.length <= 5 ? 1 : 2);
  }

  // True if every stem is covered by at least one word in the input
  function stemPhraseMatch(inputText, stems) {
    var iWords = inputText.split(/\s+/);
    return stems.every(function (stem) {
      return iWords.some(function (iw) { return wordStartsWith(iw, stem); });
    });
  }

  // "secretar" stem matches: secretary, secretaries, secretariat, etc.
  var CADRE_PATTERNS = [
    { re: /special\s*chief\s*secretar/,  tag: 'SPECIAL CHIEF SECRETARY' },
    { re: /chief\s*secretar/,            tag: 'CHIEF SECRETARY'         },
    { re: /principal\s*secretar/,        tag: 'PRINCIPAL SECRETARY'     },
    { re: /\bsecretar/,                  tag: 'SECRETARY'               },
  ];

  // Returns an ARRAY of all intents found — handles combined commands
  // e.g. "show Andhra Pradesh officers from batch 2001 to 2010"
  //       → [{ type:'domicile', … }, { type:'batch', … }]
  function parseCommands(raw) {
    var t = raw.toLowerCase().trim();
    var intents = [];

    // Reset is exclusive — return immediately
    if (/reset|clear\s*(all\s*)?(filters?)?|start\s*over/.test(t))
      return [{ type: 'reset', params: {} }];

    // Service switch
    var m = t.match(/\b(ias|ips|ifs)\b/);
    if (m) intents.push({ type: 'service', params: { svc: m[1].toUpperCase() } });

    // Weights popup
    if (/\bweight/.test(t) && !/weighted\s*score|sort|order/.test(t))
      intents.push({ type: 'weights', params: {} });

    // Sort direction — exact regex first, fuzzy word check as fallback
    var dir = null;
    if      (/desc(end|ing)?|high(est)?\s*to\s*low|best\s*first|top\s*first/.test(t)) dir = 'desc';
    else if (/asc(end|ing)?|low(est)?\s*to\s*high|bottom\s*first/.test(t))            dir = 'asc';
    else {
      var words = t.split(/\s+/);
      for (var wi = 0; wi < words.length; wi++) {
        var w = words[wi];
        if (w.length < 4) continue;
        if (levenshtein(w, 'descending') <= 3 || levenshtein(w, 'descend') <= 2) { dir = 'desc'; break; }
        if (levenshtein(w, 'ascending')  <= 3 || levenshtein(w, 'ascend')  <= 2) { dir = 'asc';  break; }
      }
    }

    // Sort key — only when sort words or direction explicitly present
    if (/sort|order|rank\s*by|arrange/.test(t) || dir) {
      var key = matchSortKey(t);
      if (key && dir) intents.push({ type: 'sort',    params: { key: key, dir: dir } });
      else if (key)   intents.push({ type: 'sort',    params: { key: key } });
      else if (dir)   intents.push({ type: 'sortdir', params: { dir: dir } });
    }

    // ── Batch year range ────────────────────────────────────────
    // Exact pattern first; fuzzy fallback for typos like "btach", "allotmnt"
    var batchM = t.match(/(?:batch|allotment|joining\s*year|joined)\s*(?:year\s*)?(\d{4})(?:\s*(?:to|and|[-–])\s*(\d{4}))?/);
    if (!batchM) {
      var tWords = t.split(/\s+/);
      var batchTrig = tWords.some(function (w) {
        return (w.length >= 4 && levenshtein(w, 'batch') <= 1) ||
               (w.length >= 6 && levenshtein(w, 'allotment') <= 3) ||
               (w.length >= 5 && levenshtein(w, 'joining') <= 2);
      });
      if (batchTrig) batchM = t.match(/(\d{4})(?:\s*(?:to|and|[-–])\s*(\d{4}))?/);
    }
    if (batchM) {
      var blo = parseInt(batchM[1], 10), bhi = batchM[2] ? parseInt(batchM[2], 10) : blo;
      intents.push({ type: 'batch', params: { lo: Math.min(blo, bhi), hi: Math.max(blo, bhi) } });
    }

    // ── Retirement year range ────────────────────────────────────
    var retireM = t.match(/retir(?:ing|ement|e)?\s*(?:between|after|before|in|from|year\s*)?(\d{4})(?:\s*(?:to|and|[-–])\s*(\d{4}))?/);
    if (!retireM) {
      var rWords = t.split(/\s+/);
      var retireTrig = rWords.some(function (w) {
        return w.length >= 5 && levenshtein(w.substring(0, 5), 'retir') <= 1;
      });
      // Only use fuzzy year extraction if batch didn't already claim those years
      if (retireTrig && !batchM) retireM = t.match(/(\d{4})(?:\s*(?:to|and|[-–])\s*(\d{4}))?/);
    }
    if (retireM) {
      var rlo = parseInt(retireM[1], 10), rhi = retireM[2] ? parseInt(retireM[2], 10) : rlo;
      intents.push({ type: 'retire', params: { lo: Math.min(rlo, rhi), hi: Math.max(rlo, rhi) } });
    }

    // ── Cadre ────────────────────────────────────────────────────
    // Stem regex first ("secretar" catches secretary/secretaries/secretariat)
    var cadreFound = false;
    for (var ci = 0; ci < CADRE_PATTERNS.length; ci++) {
      if (CADRE_PATTERNS[ci].re.test(t)) {
        intents.push({ type: 'cadre', params: { value: CADRE_PATTERNS[ci].tag } });
        cadreFound = true; break;
      }
    }
    if (!cadreFound) {
      // Stem-based fuzzy cadre — most-specific first
      var CADRE_FUZZY = [
        { stems: ['special', 'chief', 'secretar'], tag: 'SPECIAL CHIEF SECRETARY' },
        { stems: ['principal', 'secretar'],          tag: 'PRINCIPAL SECRETARY'     },
        { stems: ['chief', 'secretar'],             tag: 'CHIEF SECRETARY'         },
        { stems: ['secretar'],                       tag: 'SECRETARY'               },
      ];
      for (var cfi = 0; cfi < CADRE_FUZZY.length; cfi++) {
        if (stemPhraseMatch(t, CADRE_FUZZY[cfi].stems)) {
          intents.push({ type: 'cadre', params: { value: CADRE_FUZZY[cfi].tag } });
          cadreFound = true; break;
        }
      }
    }
    if (!cadreFound) {
      var cadreMatch = matchSelectOption('fCadre', t, true);
      if (cadreMatch) intents.push({ type: 'cadre', params: { value: cadreMatch } });
    }

    // ── Source of recruitment ────────────────────────────────────
    // Fuzzy shorthand detection first, then select option fuzzy match
    var sourceFound = false;
    var sWords = t.split(/\s+/);
    var hasDirect  = sWords.some(function (w) { return w.length >= 5 && levenshtein(w, 'direct') <= 1; });
    var hasRecruit = sWords.some(function (w) { return w.length >= 6 && levenshtein(w, 'recruit') <= 2; });
    var hasPromote = sWords.some(function (w) { return w.length >= 6 && wordStartsWith(w, 'promot'); });
    if (hasDirect && hasRecruit) {
      intents.push({ type: 'source', params: { value: '__dr__' } });
      sourceFound = true;
    } else if (hasPromote) {
      intents.push({ type: 'source', params: { value: '__promo__' } });
      sourceFound = true;
    }
    if (!sourceFound) {
      var srcMatch = matchSelectOption('fSource', t, true);
      if (srcMatch) intents.push({ type: 'source', params: { value: srcMatch } });
    }

    // ── Domicile ─────────────────────────────────────────────────
    var domMatch = matchSelectOption('fDomicile', t, true);
    if (domMatch) intents.push({ type: 'domicile', params: { value: domMatch } });

    // ── Post Type ─────────────────────────────────────────────────
    // Skip if text only has generic filler words to avoid false positives
    var postTypeMatch = matchSelectOption('fPostType', t, true);
    if (postTypeMatch) intents.push({ type: 'postType', params: { value: postTypeMatch } });

    // ── Name search — only when nothing else matched ──────────────
    if (intents.length === 0) {
      m = t.match(/(?:search|find|look\s*for|show\s*officer|officer\s*named?|name)\s+([a-z\s]{2,})/);
      if (!m) m = t.match(/^([a-z][a-z\s]{2,})$/); // bare name as last resort
      if (m) intents.push({ type: 'name', params: { value: m[1].trim() } });
    }

    return intents.length > 0 ? intents : null;
  }

  function describeIntent(intent) {
    switch (intent.type) {
      case 'service':  return 'Switched to ' + intent.params.svc + ' officers';
      case 'reset':    return 'All filters cleared';
      case 'weights':  return 'Weights panel opened';
      case 'cadre':    return 'Cadre: ' + intent.params.value;
      case 'source': {
        var sv = intent.params.value;
        return 'Source: ' + (sv === '__dr__' ? 'Direct Recruit' : sv === '__promo__' ? 'Promoted' : sv);
      }
      case 'domicile': return 'Domicile: ' + intent.params.value;
      case 'postType': return 'Post Type: ' + intent.params.value;
      case 'name':     return 'Searching for "' + intent.params.value + '"';
      case 'batch':
        return 'Batch ' + intent.params.lo + (intent.params.lo !== intent.params.hi ? ' – ' + intent.params.hi : '');
      case 'retire':
        return 'Retiring ' + intent.params.lo + (intent.params.lo !== intent.params.hi ? ' – ' + intent.params.hi : '');
      case 'sort': {
        var sel = document.getElementById('sortSelect360');
        var opt = sel && Array.prototype.filter.call(sel.options, function (o) { return o.value === intent.params.key; })[0];
        var lbl = opt ? opt.text.replace(/^.\s*/, '') : intent.params.key;
        return 'Sorted by ' + lbl + (intent.params.dir ? ' (' + (intent.params.dir === 'desc' ? 'Desc ↓' : 'Asc ↑') + ')' : '');
      }
      case 'sortdir': return 'Direction: ' + (intent.params.dir === 'desc' ? 'Descending ↓' : 'Ascending ↑');
      default: return 'Done';
    }
  }

  function applyDir(wantDir) {
    var btn = document.getElementById('sortDirBtn');
    var current = (btn && btn.textContent.indexOf('↑') !== -1) ? 'asc' : 'desc';
    if (wantDir !== current && window.toggleSortDir) window.toggleSortDir();
  }

  function dispatchAction(intent) {
    switch (intent.type) {
      case 'service':
        if (window.switchSvc) window.switchSvc(intent.params.svc);
        break;
      case 'reset':
        if (window.reset360) window.reset360();
        break;
      case 'weights':
        if (window.openWeightsPopup) window.openWeightsPopup();
        break;
      case 'cadre': {
        var csel = document.getElementById('fCadre');
        if (!csel) break;
        // Try direct assignment (works when value came from matchSelectOption)
        csel.value = intent.params.value;
        if (!csel.value) {
          // Fallback: substring match for CADRE_PATTERNS tag names vs option values
          var ctarget = intent.params.value.toLowerCase();
          for (var ci = 0; ci < csel.options.length; ci++) {
            var cv = csel.options[ci].value.toLowerCase();
            if (cv && (ctarget.indexOf(cv) !== -1 || cv.indexOf(ctarget) !== -1)) {
              csel.value = csel.options[ci].value; break;
            }
          }
        }
        if (window.applyFilters360) window.applyFilters360();
        break;
      }
      case 'source': {
        var ssel = document.getElementById('fSource');
        if (!ssel) break;
        var sv = intent.params.value;
        var smatched = '';
        for (var si = 0; si < ssel.options.length; si++) {
          var sov = ssel.options[si].value;
          if (!sov) continue;
          if (sv === '__dr__'    && /direct/i.test(sov))  { smatched = sov; break; }
          if (sv === '__promo__' && /promot/i.test(sov))  { smatched = sov; break; }
          if (sov === sv)                                  { smatched = sov; break; }
        }
        ssel.value = smatched;
        if (window.applyFilters360) window.applyFilters360();
        break;
      }
      case 'domicile': {
        var dsel = document.getElementById('fDomicile');
        if (dsel) dsel.value = intent.params.value;
        if (window.applyFilters360) window.applyFilters360();
        break;
      }
      case 'postType': {
        var ptsel = document.getElementById('fPostType');
        if (!ptsel) break;
        // Try direct assignment; if exact value not found, fuzzy-match at dispatch time
        ptsel.value = intent.params.value;
        if (!ptsel.value) {
          var pttarget = intent.params.value.toLowerCase();
          for (var pti = 0; pti < ptsel.options.length; pti++) {
            var ptv = ptsel.options[pti].value.toLowerCase();
            if (ptv && (pttarget.indexOf(ptv) !== -1 || ptv.indexOf(pttarget) !== -1)) {
              ptsel.value = ptsel.options[pti].value; break;
            }
          }
        }
        if (window.applyFilters360) window.applyFilters360();
        break;
      }
      case 'name': {
        var inp = document.getElementById('searchName360');
        if (inp) inp.value = intent.params.value;
        if (window.applyFilters360) window.applyFilters360();
        break;
      }
      case 'batch': {
        var blo = document.getElementById('batchLo');
        var bhi = document.getElementById('batchHi');
        if (blo) blo.value = intent.params.lo;
        if (bhi) bhi.value = intent.params.hi;
        if (window.onSlider) window.onSlider('batch');
        break;
      }
      case 'retire': {
        var rlo = document.getElementById('retireLo');
        var rhi = document.getElementById('retireHi');
        if (rlo) rlo.value = intent.params.lo;
        if (rhi) rhi.value = intent.params.hi;
        if (window.onSlider) window.onSlider('retire');
        break;
      }
      case 'sort': {
        var sortSel = document.getElementById('sortSelect360');
        if (sortSel && intent.params.key) {
          sortSel.value = intent.params.key;
          if (window.applySort360) window.applySort360();
        }
        if (intent.params.dir) applyDir(intent.params.dir);
        break;
      }
      case 'sortdir':
        applyDir(intent.params.dir);
        break;
    }
  }

  // ================================================================
  // CHAT UI
  // ================================================================

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Female voice helper ───────────────────────────────────────
  function _pickFemaleVoice(voices) {
    var prefer = ['zira','hazel','heera','raveena','veena','kanya',
                  'samantha','victoria','karen','moira','aria','jenny',
                  'natasha','female','woman'];
    for (var i = 0; i < voices.length; i++) {
      var n = voices[i].name.toLowerCase();
      for (var j = 0; j < prefer.length; j++) {
        if (n.indexOf(prefer[j]) !== -1) return voices[i];
      }
    }
    for (var k = 0; k < voices.length; k++) {
      if (/^en/i.test(voices[k].lang)) return voices[k];
    }
    return voices[0] || null;
  }

  function _getVoice(cb) {
    if (!SS) { cb(null); return; }
    var v = SS.getVoices();
    if (v.length) { cb(_pickFemaleVoice(v)); return; }
    SS.onvoiceschanged = function () { cb(_pickFemaleVoice(SS.getVoices())); };
  }

  function speakWelcome(onDone) {
    if (!SS) { if (onDone) onDone(); return; }
    SS.cancel();
    var utt = new SpeechSynthesisUtterance(
      'Hello! I am Alkra, your smart assistant. ' +
      'I can sort the officers list and filter by cadre, domicile, source, and post type. ' +
      'Go ahead, tell me what you need!'
    );
    utt.pitch  = 1.18;
    utt.rate   = 0.9;
    utt.volume = 1;
    if (onDone) utt.onend = onDone;
    _getVoice(function (voice) {
      if (voice) utt.voice = voice;
      SS.speak(utt);
    });
  }

  // ── Wake word listener ("Hi Alkra") ──────────────────────────
  function startWakeListener() {
    if (!SR || wakeActive) return;
    wakeActive = true;
    _rebuildWakeRec();
  }

  function _rebuildWakeRec() {
    if (!wakeActive) return;
    try {
      wakeRec                = new SR();
      wakeRec.continuous     = true;
      wakeRec.interimResults = true;
      wakeRec.lang           = 'en-IN';
      wakeRec.onresult = function (ev) {
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var t     = ev.results[i][0].transcript.toLowerCase().trim();
          var words = t.split(/\s+/);
          var hasGreet = words.some(function (w) { return /^(hi|hey|hello)$/.test(w); });
          var hasName  = words.some(function (w) {
            return w.length >= 3 && levenshtein(w, 'alkra') <= 2;
          });
          if (hasGreet && hasName) { wakeWordDetected(); break; }
        }
      };
      wakeRec.onend = function () {
        if (wakeActive) setTimeout(_rebuildWakeRec, 300);
      };
      wakeRec.onerror = function (ev) {
        if (ev.error === 'not-allowed') { wakeActive = false; return; }
        if (wakeActive) setTimeout(_rebuildWakeRec, 1000);
      };
      wakeRec.start();
    } catch (e) { wakeActive = false; }
  }

  function stopWakeListener() {
    wakeActive = false;
    if (wakeRec) { try { wakeRec.abort(); } catch (e) {} wakeRec = null; }
  }

  function wakeWordDetected() {
    stopWakeListener();
    if (!isOpen) openChat();
    addMsg('bot',
      '<b>Hi! I\'m Alkra</b> &#129302; &#128075;<br>' +
      '<small style="color:#6b7280">Listening for your command after I finish speaking…</small>'
    );
    setSt('Speaking…');
    speakWelcome(function () {
      setSt('Listening…');
      setTimeout(startVoiceCommand, 250);
    });
  }

  // ── Voice command: one-shot, auto-process, auto-close ─────────
  function startVoiceCommand() {
    if (!SR) {
      addMsg('bot', 'Voice input needs Chrome or Edge. Please type your command.');
      var inp0 = document.getElementById('alkraInput');
      if (inp0) inp0.focus();
      return;
    }
    if (micActive && micRec) { micRec.abort(); return; }

    micRec = new SR();
    micRec.lang            = 'en-IN';
    micRec.continuous      = false;
    micRec.interimResults  = true;
    micRec.maxAlternatives = 1;

    micRec.onstart = function () {
      micActive = true;
      setMicBtnState(true);
      var inp = document.getElementById('alkraInput');
      if (inp) { inp.value = ''; inp.placeholder = 'Listening…'; }
    };

    micRec.onresult = function (ev) {
      var result = ev.results[ev.results.length - 1];
      var inp = document.getElementById('alkraInput');
      if (inp) inp.value = result[0].transcript;
      if (result.isFinal) {
        var spoken = result[0].transcript;
        micActive = false; micRec = null;
        setMicBtnState(false);
        _processVoiceCommand(spoken);
      }
    };

    micRec.onerror = function (ev) {
      micActive = false; micRec = null;
      setMicBtnState(false);
      setSt('Online');
      if (ev.error === 'not-allowed') {
        addMsg('bot', '&#128274; Mic blocked — allow microphone access in your browser.');
      } else if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
        addMsg('bot', 'Mic error: ' + ev.error + '. Please type instead.');
      }
    };

    micRec.onend = function () {
      micActive = false; micRec = null;
      setMicBtnState(false);
      setSt('Online');
    };

    try {
      micRec.start();
    } catch (ex) {
      micActive = false; micRec = null;
      setMicBtnState(false);
      addMsg('bot', 'Could not start mic: ' + ex.message);
    }
  }

  // Auto-process voice result: task found → close; no task → stay open
  function _processVoiceCommand(text) {
    text = (text || '').trim();
    if (!text) return;
    var inp = document.getElementById('alkraInput');
    if (inp) inp.value = '';
    addMsg('user', esc(text));
    setSt('Online');

    if (/^\s*(bye|goodbye|close|exit|done|thanks?|thank\s*you)\s*$/i.test(text)) {
      showTyping(function () {
        addMsg('bot', 'Goodbye! &#128075;');
        setTimeout(window.alkraClose, 800);
      });
      return;
    }

    var intents = parseCommands(text);
    showTyping(function () {
      if (intents) {
        intents.forEach(function (intent) { dispatchAction(intent); });
        var lines = intents.map(function (i) { return '&#9989; ' + esc(describeIntent(i)); }).join('<br>');
        addMsg('bot', lines + '<br><small style="color:#6b7280">Done! Closing…</small>');
        setTimeout(window.alkraClose, 1800);   // auto-close after voice task
      } else {
        addMsg('bot',
          'I didn\'t quite catch that. &#129300;<br>' +
          '<small style="color:#6b7280">Please try again or type your command below.</small>'
        );
        if (inp) inp.focus();                  // stay open — let user try again
      }
    });
  }

  // ── Speech-to-text for the input field ────────────────────────
  function setMicBtnState(listening) {
    var btn = document.getElementById('alkraMicBtn');
    if (!btn) return;
    btn.classList.toggle('listening', listening);
    btn.title = listening ? 'Stop — click to cancel' : 'Speak your command';
    var inp = document.getElementById('alkraInput');
    if (inp) inp.placeholder = listening ? 'Listening…' : 'Type a command…';
    // Drive cat-ear animations + fast FAB breath via CSS state classes
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.toggle('listening', listening);
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.toggle('listening', listening);
  }

  // Mic button delegates to the auto-process voice command flow
  function startMicInput() { startVoiceCommand(); }

  var CHIPS = [
    'Principal Secretary', 'direct recruit', 'sort by CMO descending',
    'batch 1990 to 2000', 'retiring 2026 to 2030', 'reset'
  ];

  function buildUI() {
    if (document.getElementById('alkraBtn')) return;

    // ── Floating button ───────────────────────────────────────────
    var fab = document.createElement('button');
    fab.id    = 'alkraBtn';
    fab.title = 'Alkra — Filter assistant';
    fab.innerHTML = CAT_SVG;
    fab.addEventListener('click', window.alkraToggle);
    document.body.appendChild(fab);

    // ── Chat panel ────────────────────────────────────────────────
    var panel = document.createElement('div');
    panel.id = 'alkraPanel';

    // Header
    var hdr = document.createElement('div');
    hdr.className = 'alkra-hdr';
    hdr.innerHTML =
      '<div class="alkra-hdr-left">' +
        '<div class="alkra-avatar">' + CAT_SVG + '</div>' +
        '<div>' +
          '<div class="alkra-name">Alkra</div>' +
          '<div class="alkra-st" id="alkraSt">Filter Assistant</div>' +
        '</div>' +
      '</div>' +
      '<button class="alkra-x" onclick="alkraClose()">&#10005;</button>';

    // Messages area
    var msgs = document.createElement('div');
    msgs.className = 'alkra-msgs';
    msgs.id = 'alkraMsgs';

    // Quick-command chips
    var chips = document.createElement('div');
    chips.className = 'alkra-chips';
    chips.id = 'alkraChips';
    CHIPS.forEach(function (label) {
      var ch = document.createElement('button');
      ch.className = 'alkra-chip';
      ch.textContent = label;
      ch.addEventListener('click', function () { handleInput(label); });
      chips.appendChild(ch);
    });

    // Input row
    var inputRow = document.createElement('div');
    inputRow.className = 'alkra-input-row';
    var input = document.createElement('input');
    input.type        = 'text';
    input.id          = 'alkraInput';
    input.placeholder = 'Type a command…';
    input.autocomplete = 'off';
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); handleInput(input.value); }
    });
    // Mic button
    var micBtn = document.createElement('button');
    micBtn.id    = 'alkraMicBtn';
    micBtn.title = SR ? 'Speak your command' : 'Voice needs Chrome/Edge';
    micBtn.innerHTML = '&#127908;';  // 🎤
    if (SR) micBtn.dataset.sr = '1'; // enables the CSS (removes 0.35 opacity)
    micBtn.addEventListener('click', startMicInput);

    // Send button
    var sendBtn = document.createElement('button');
    sendBtn.id = 'alkraSendBtn';
    sendBtn.title = 'Send';
    sendBtn.innerHTML = '&#8629;';   // ↩
    sendBtn.addEventListener('click', function () { handleInput(input.value); });

    inputRow.appendChild(input);
    inputRow.appendChild(micBtn);
    inputRow.appendChild(sendBtn);

    panel.appendChild(hdr);
    panel.appendChild(msgs);
    panel.appendChild(chips);
    panel.appendChild(inputRow);
    document.body.appendChild(panel);

    // Greet
    addMsg('bot',
      'Hello! I\'m <b>Alkra</b> &#129302; &#128075;<br>' +
      'I can filter and sort the officer list.<br>' +
      '<small style="color:#6b7280">Say <b>"Hi Alkra"</b> to wake me by voice, or type a command below.</small>'
    );
  }

  function addMsg(role, html) {
    var msgs = document.getElementById('alkraMsgs');
    if (!msgs) return;
    var row = document.createElement('div');
    row.className = 'alkra-msg ' + role;
    var bbl = document.createElement('div');
    bbl.className = 'alkra-bbl';
    bbl.innerHTML = html;
    row.appendChild(bbl);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setSt(text) {
    var el = document.getElementById('alkraSt');
    if (el) el.textContent = text;
  }

  function addTypingIndicator() {
    var msgs = document.getElementById('alkraMsgs');
    if (!msgs) return;
    var row = document.createElement('div');
    row.className = 'alkra-msg bot';
    row.id = 'alkraTyping';
    var bbl = document.createElement('div');
    bbl.className = 'alkra-bbl';
    bbl.innerHTML = '<div class="alkra-dots"><span></span><span></span><span></span></div>';
    row.appendChild(bbl);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTypingIndicator() {
    var el = document.getElementById('alkraTyping');
    if (el) el.parentNode.removeChild(el);
  }

  function showTyping(callback) {
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.add('typing');
    addTypingIndicator();
    setTimeout(function () {
      removeTypingIndicator();
      if (panel) panel.classList.remove('typing');
      callback();
    }, 600);
  }

  // ── Handle a submitted command (from input or chip) ───────────
  function handleInput(raw) {
    var text = (raw || '').trim();
    if (!text) return;

    var inp = document.getElementById('alkraInput');
    if (inp) inp.value = '';

    addMsg('user', esc(text));

    // Bye / close
    if (/^\s*(bye|goodbye|close|exit|done|thanks?|thank\s*you)\s*$/i.test(text)) {
      showTyping(function () {
        addMsg('bot', 'Goodbye! Click the button anytime to come back. &#128075;');
        setTimeout(window.alkraClose, 900);
      });
      return;
    }

    // Help
    if (/^\s*help\s*$/i.test(text)) {
      showTyping(function () { addMsg('bot', helpText()); if (inp) inp.focus(); });
      return;
    }

    var intents = parseCommands(text);
    showTyping(function () {
      if (intents) {
        intents.forEach(function (intent) { dispatchAction(intent); });
        var lines = intents.map(function (i) { return '&#9989; ' + esc(describeIntent(i)); }).join('<br>');
        addMsg('bot', lines + '<br><small style="color:#6b7280">Anything else?</small>');
      } else {
        addMsg('bot',
          'I didn\'t understand that. &#129300;<br>' +
          '<small style="color:#6b7280">Try: "sort by CMO score descending", "batch 1990 to 2000", "show Andhra Pradesh batch 2001 to 2010", or "reset". Type <b>help</b> for all commands.</small>'
        );
      }
      if (inp) inp.focus();
    });
  }

  function helpText() {
    return '<b>Filters I can set:</b><br>' +
      '<b>Cadre</b> — "Principal Secretary", "Chief Secretary", "Secretary"…<br>' +
      '<b>Source</b> — "direct recruit", "promoted"<br>' +
      '<b>Domicile</b> — "Andhra Pradesh", "Telangana"…<br>' +
      '<b>Post Type</b> — any post type name (e.g. "Secretary to GoAP")<br>' +
      '<b>Batch</b> — "batch 1990 to 2000"<br>' +
      '<b>Retiring</b> — "retiring 2026 to 2028"<br>' +
      '<b>Sort</b> — "sort by CMO score descending"<br>' +
      '<b>Service</b> — "IAS" / "IPS" / "IFS"<br>' +
      '<b>Search</b> — "search Kumar"<br>' +
      '<b>Reset</b> — clear all filters<br>' +
      '<small style="color:#92400e">Combine: "Andhra Pradesh direct recruit batch 2000 to 2010"</small>';
  }

  // ── Open / close ──────────────────────────────────────────────
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    stopWakeListener();
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.add('open');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.add('open');
    setSt('Online');
    setTimeout(function () {
      var inp = document.getElementById('alkraInput');
      if (inp) inp.focus();
    }, 300);
  }

  window.alkraClose = function () {
    isOpen = false;
    // Stop any in-progress mic or speech
    if (micActive && micRec) { try { micRec.abort(); } catch (e) {} micRec = null; micActive = false; }
    if (SS) SS.cancel();
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.remove('open', 'listening', 'typing');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.remove('open', 'listening');
    setSt('Filter Assistant');
    // Re-arm wake word listener after panel closes
    setTimeout(startWakeListener, 600);
  };

  window.alkraToggle = function () { isOpen ? window.alkraClose() : openChat(); };

  // Expose send so inline onclick can call it if needed
  window.alkraSend = function () {
    var inp = document.getElementById('alkraInput');
    if (inp) handleInput(inp.value);
  };

  // ================================================================
  // INIT
  // ================================================================

  function _init() {
    buildUI();
    // Start wake-word listener after a short delay
    // (gives Chrome time to set up; prompts mic permission on first use)
    setTimeout(startWakeListener, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
