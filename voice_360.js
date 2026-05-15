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
  var isProcessing   = false; // true while a voice command is being handled
  var listeningPaused = false; // true while user is actively typing

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
    if (/reset|clear\s*(all\s*)?(filters?)?|start\s*over|show\s*all/.test(t))
      return [{ type: 'reset', params: {} }];

    // Close popup is exclusive
    if (/^(?:close|dismiss|exit|shut)\s*(?:the\s*)?(?:popup|card|modal|window|detail|it|this)?\s*$/.test(t))
      return [{ type: 'closePopup', params: {} }];

    // ── Popup tab switches (work when detail popup is open or from chatbot) ──
    if (/\bshow\s+(?:department|dept)\s*(?:wise)?\b/i.test(t))
      return [{ type: 'showTab', params: { tab: 'dept', label: 'Department-wise' } }];
    if (/\bshow\s+categor\w*\s*(?:wise)?\b/i.test(t))
      return [{ type: 'showTab', params: { tab: 'cat',  label: 'Category-wise'   } }];
    if (/\bshow\s+(?:chief\s*min\w*|hcm|cm)\s*(?:wise)?\b/i.test(t))
      return [{ type: 'showTab', params: { tab: 'hcm',  label: 'Chief Minister-wise' } }];
    if (/\bshow\s+service\s*(?:records?)?\b/i.test(t))
      return [{ type: 'showTab', params: { tab: 'svc',  label: 'Service Records' } }];

    // ── Open 360° wheel popup ───────────────────────────────────────────────
    if (/\bshow\s+(?:360|three\s*sixty|wheel|profile\s*view)\b/i.test(t))
      return [{ type: 'show360', params: {} }];

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

    // ── Open officer detail popup ────────────────────────────────
    // "open Kumar" / "open officer Ravi Kumar" / "open profile of Sharma"
    var openOfficerM = t.match(/^open\s+(?:officer\s+|profile\s+(?:of\s+)?|detail\s+(?:of\s+)?)?(.{2,})$/);
    if (openOfficerM) {
      intents.push({ type: 'openOfficer', params: { name: openOfficerM[1].trim() } });
    }

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
      case 'postType':    return 'Post Type: ' + intent.params.value;
      case 'name':        return 'Searching for "' + intent.params.value + '"';
      case 'openOfficer': return 'Opening profile: ' + intent.params.name;
      case 'closePopup':  return 'Popup closed';
      case 'showTab':     return 'Showing ' + (intent.params.label || intent.params.tab);
      case 'show360':     return 'Opening 360° Profile View';
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

  // Fuzzy name match for officer cards: returns 0..1 (higher = better match)
  function fuzzyNameMatch(spoken, cardName) {
    var s = spoken.toLowerCase().trim();
    var c = cardName.toLowerCase().trim();
    if (c.indexOf(s) !== -1 || s.indexOf(c) !== -1) return 1; // substring hit
    var sw = s.split(/\s+/).filter(function (w) { return w.length > 1; });
    var cw = c.split(/\s+/);
    if (!sw.length) return 0;
    var hits = sw.filter(function (w) {
      var thr = Math.floor(w.length / 4);
      return cw.some(function (cv) { return levenshtein(w, cv) <= thr; });
    });
    return hits.length / sw.length;
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

      case 'openOfficer': {
        var cards = document.querySelectorAll('.c360[data-name]');
        var bestCard = null, bestScore = -1;
        cards.forEach(function (card) {
          var s = fuzzyNameMatch(intent.params.name, card.getAttribute('data-name') || '');
          if (s > bestScore) { bestScore = s; bestCard = card; }
        });
        if (bestCard && bestScore >= 0.5) {
          bestCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function () { bestCard.click(); }, 400);
        }
        break;
      }

      case 'showTab': {
        if (window.switchDetailTab) window.switchDetailTab(intent.params.tab);
        break;
      }
      case 'show360': {
        var btn360 = document.getElementById('detailBtnWheel');
        if (btn360) btn360.click();
        break;
      }
      case 'closePopup': {
        // Close 360° wheel overlay first (highest priority)
        var wOvW = document.getElementById('wheelOverlay');
        if (wOvW && wOvW.classList.contains('open')) {
          var wheelCloseBtn = document.getElementById('wheelClose');
          if (wheelCloseBtn) wheelCloseBtn.click(); else wOvW.classList.remove('open');
          break;
        }
        // Close officer detail overlay
        var detOvD = document.getElementById('detailOverlay');
        if (detOvD && detOvD.classList.contains('open')) {
          detOvD.classList.remove('open'); break;
        }
        // Close weights overlay
        var wOvD = document.getElementById('weightsOverlay');
        if (wOvD && wOvD.style.display !== 'none') {
          wOvD.style.display = 'none'; break;
        }
        // Close any segment popup
        document.querySelectorAll('.sdp-popup-bg').forEach(function (bg) { bg.remove(); });
        break;
      }
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
    var done = false;
    var finish = function (voices) { if (!done) { done = true; cb(_pickFemaleVoice(voices || [])); } };
    SS.onvoiceschanged = function () { finish(SS.getVoices()); };
    setTimeout(function () { finish(SS.getVoices()); }, 2500); // fallback if event never fires
  }

  // Unlock TTS on the very first user interaction so wake-word speech works
  // without needing the user to click the Alkra FAB first.
  function _unlockTTSOnce() {
    document.removeEventListener('click',      _unlockTTSOnce, true);
    document.removeEventListener('keydown',    _unlockTTSOnce, true);
    document.removeEventListener('touchstart', _unlockTTSOnce, true);
    if (!SS) return;
    var u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    SS.speak(u);
    setTimeout(function () { SS.cancel(); }, 200);
  }
  document.addEventListener('click',      _unlockTTSOnce, true);
  document.addEventListener('keydown',    _unlockTTSOnce, true);
  document.addEventListener('touchstart', _unlockTTSOnce, true);

  function speakWelcome(onDone) {
    if (!SS) { if (onDone) onDone(); return; }
    SS.cancel();
    var done = false;
    var finish = function () { if (!done) { done = true; if (onDone) onDone(); } };
    var utt = new SpeechSynthesisUtterance(
      'Hello! I am Alkra, your smart assistant. ' +
      'I can sort the officers list, filter by cadre, domicile, source, and post type, ' +
      'open officer profiles, and reset all filters. ' +
      'Go ahead, tell me what you need!'
    );
    utt.pitch  = 1.18;
    utt.rate   = 0.9;
    utt.volume = 1;
    utt.onend  = finish;
    utt.onerror = finish; // don't hang if browser blocks TTS
    // Chrome sometimes pauses long utterances silently — keep it alive
    var keepAlive = setInterval(function () {
      if (SS.speaking) { SS.pause(); SS.resume(); }
    }, 8000);
    utt.onend = utt.onerror = function () {
      clearInterval(keepAlive); finish();
    };
    _getVoice(function (voice) {
      if (voice) utt.voice = voice;
      SS.speak(utt);
    });
    // Hard fallback: if TTS never fires (browser blocks audio), continue after 9 s
    setTimeout(finish, 9000);
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
      wakeRec.interimResults = true;  // interim results give faster wake-word response
      wakeRec.lang           = 'en-IN'; // English-India; reliable for "Hi Alkra" + Indian English commands
      wakeRec.onresult = function (ev) {
        if (isProcessing || listeningPaused) return;
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var isFinal = ev.results[i].isFinal;
          var raw     = ev.results[i][0].transcript.trim();
          var tl      = raw.toLowerCase();

          // ── COMMAND MODE: chatbot is open — process any FINAL speech ──
          if (isOpen) {
            if (!isFinal) continue; // wait for complete phrase
            // Strip optional "Alkra" prefix if user says "Alkra show department wise"
            var cmdText = raw.replace(/^(?:hi\s+|hey\s+)?(?:alkra|elcra|alcra|alka)\s*/i, '').trim();
            if (!cmdText) cmdText = raw;
            if (cmdText) { isProcessing = true; _processVoiceCommand(cmdText); }
            return;
          }

          // ── WAKE MODE: chatbot is closed — scan for "Alkra" ──
          var words    = tl.split(/\s+/);
          var alkraIdx = -1;
          for (var wi = 0; wi < words.length; wi++) {
            if (words[wi].length >= 3 && levenshtein(words[wi], 'alkra') <= 2) {
              alkraIdx = wi; break;
            }
          }
          if (alkraIdx === -1) continue;

          // Words after "Alkra", ignoring filler words
          var postWords = words.slice(alkraIdx + 1).filter(function (w) {
            return !/^(hi|hey|hello|please|ok|okay)$/.test(w);
          });

          if (postWords.length > 0 && isFinal) {
            // "Alkra open Kumar" — compound command on final result
            isProcessing = true;
            _wakeWithCommand(postWords.join(' '));
            break;
          } else if (postWords.length === 0) {
            // "Alkra" or "Hi Alkra" alone — wake immediately even on interim
            isProcessing = true;
            wakeWordDetected();
            break;
          }
          // "Alkra [words]" seen but not final yet — keep waiting
        }
      };
      wakeRec.onstart = function () {
        // Show mic-active glow on FAB so user knows we're always listening
        var fab = document.getElementById('alkraBtn');
        if (fab) fab.classList.add('wake-on');
        // Unlock TTS on first mic grant
        if (SS) {
          var u = new SpeechSynthesisUtterance('');
          u.volume = 0;
          SS.speak(u);
          setTimeout(function () { SS.cancel(); }, 200);
        }
      };
      wakeRec.onend = function () {
        var fab = document.getElementById('alkraBtn');
        if (fab) fab.classList.remove('wake-on');
        if (wakeActive && !listeningPaused) setTimeout(_rebuildWakeRec, 300);
      };
      wakeRec.onerror = function (ev) {
        var fab = document.getElementById('alkraBtn');
        if (fab) fab.classList.remove('wake-on');
        if (ev.error === 'not-allowed') { wakeActive = false; return; }
        if (wakeActive && !listeningPaused) setTimeout(_rebuildWakeRec, 1000);
      };
      wakeRec.start();
    } catch (e) { wakeActive = false; }
  }

  function stopWakeListener() {
    wakeActive = false;
    if (wakeRec) { try { wakeRec.abort(); } catch (e) {} wakeRec = null; }
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.remove('wake-on');
  }

  // 360° wheel segment → term table (maps spoken words to segment index 0-13)
  var WHEEL_TERMS = [
    ['e office', 'eoffice', 'e-office', 'electronic office'],            // 0 e-Office
    ['swarna ap', 'swarna andhra', 'swarna'],                            // 1 Swarna AP
    ['gsdp', 'gross state domestic'],                                    // 2 GSDP
    ['goi fund', 'central fund', 'central scheme', 'goi'],               // 3 GoI Funds
    ['public perception', 'perception', 'public opinion'],               // 4 Public Perception
    ['innovation', 'innovative'],                                        // 5 Innovations
    ['digitalisation', 'digitalization', 'digital'],                     // 6 Digitalisation
    ['new policy', 'new policies', 'policy'],                            // 7 New Policies
    ['deregularisation', 'deregularization', 'deregular'],               // 8 De Regularisation
    ['integrity index', 'integrity'],                                    // 9 Integrity Index
    ['party feedback', 'party rating', 'party'],                         // 10 Party Feedback
    ['media feedback', 'media rating', 'media'],                         // 11 Media Feedback
    ['leadership skill', 'leadership'],                                   // 12 Leadership Skills
    ['cmo score', 'cmo rating', 'chief minister score', 'cmo'],          // 13 CMO Score
  ];

  // Handle popup tab commands when the officer detail popup is open
  function _processPopupCommand(t) {
    if (/\bdepart/i.test(t)) {
      if (window.switchDetailTab) window.switchDetailTab('dept'); return true;
    }
    if (/\bcategor/i.test(t)) {
      if (window.switchDetailTab) window.switchDetailTab('cat');  return true;
    }
    if (/chief\s*min|minister|\bhcm\b|\bcm\b/i.test(t)) {
      if (window.switchDetailTab) window.switchDetailTab('hcm');  return true;
    }
    if (/service\s*rec|service\s*record|\bsvc\b|\brecord/i.test(t)) {
      if (window.switchDetailTab) window.switchDetailTab('svc');  return true;
    }
    if (/360|wheel|profile\s*view/i.test(t)) {
      var btn = document.getElementById('detailBtnWheel');
      if (btn) { btn.click(); return true; }
    }
    return false;
  }

  // Open a 360° wheel segment by spoken name
  function _processWheelCommand(t) {
    var idx = -1;
    for (var ci = 0; ci < WHEEL_TERMS.length && idx < 0; ci++) {
      for (var ti = 0; ti < WHEEL_TERMS[ci].length; ti++) {
        if (t.indexOf(WHEEL_TERMS[ci][ti]) !== -1) { idx = ci; break; }
      }
    }
    if (idx >= 0) {
      if (window.openWheelSegment) {
        window.openWheelSegment(idx);
      } else {
        var segs = document.querySelectorAll('#wheelSvg .seg-group');
        if (segs[idx]) segs[idx].click();
      }
    }
  }

  // Dispatch a command that arrived WITH the wake word in the same utterance.
  // wakeRec keeps running throughout — no stop/start needed.
  function _wakeWithCommand(command) {
    var t = command.toLowerCase();

    // "close the chatbot" — explicit close
    if (/close.*chat(bot)?|chatbot.*close|chat.*close/i.test(t)) {
      if (isOpen) window.alkraClose();
      setTimeout(function () { isProcessing = false; }, 500);
      return;
    }

    // Determine current UI context
    var wheelOv  = document.getElementById('wheelOverlay');
    var detailOv = document.getElementById('detailOverlay');
    var wheelOpen  = wheelOv  && wheelOv.classList.contains('open');
    var popupOpen  = detailOv && detailOv.classList.contains('open');

    if (wheelOpen) {
      _processWheelCommand(t);
      setTimeout(function () { isProcessing = false; }, 800);
      return;
    }
    if (popupOpen) {
      var handled = _processPopupCommand(t);
      if (!handled) {
        // Popup open but unknown command → open chatbot to clarify
        if (!isOpen) openChat();
        _processVoiceCommand(command); // clears isProcessing inside
      } else {
        setTimeout(function () { isProcessing = false; }, 800);
      }
      return;
    }

    // No popup — open chatbot and process normally
    if (!isOpen) openChat();
    _processVoiceCommand(command); // clears isProcessing inside
  }

  function wakeWordDetected() {
    if (!isOpen) openChat();
    addMsg('bot',
      '<b>Hi! I\'m Alkra</b> &#129302; &#128075;<br>' +
      '<small style="color:#6b7280">Listening… say your command in English or Telugu.</small>'
    );
    setSt('Listening…');
    // wakeRec (always-on) picks up the next command automatically
    setTimeout(function () { isProcessing = false; }, 400);
  }

  // ── Voice command: one-shot, auto-process, auto-close ─────────
  function startVoiceCommand() {
    if (!SR) {
      addMsg('bot', 'Voice input needs Chrome or Edge. Please type your command.');
      return;
    }
    // Toggle off if already running
    if (micActive && micRec) { micRec.abort(); return; }

    // Pause the always-on wakeRec — Chrome only allows one recognizer at a time
    var wasWakeActive = wakeActive;
    if (wakeRec) { try { wakeRec.abort(); } catch (e) {} wakeRec = null; }
    wakeActive = false;

    micRec = new SR();
    micRec.lang            = 'te-IN';
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
        isProcessing = true;
        _processVoiceCommand(spoken);
      }
    };

    micRec.onerror = function (ev) {
      micActive = false; micRec = null;
      setMicBtnState(false);
      if (ev.error === 'not-allowed') {
        addMsg('bot', '&#128274; Mic blocked — allow microphone access in your browser.');
      } else if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
        addMsg('bot', 'Mic error: ' + ev.error + '. Please type instead.');
      }
      // Resume always-on listener
      if (wasWakeActive) { wakeActive = true; _rebuildWakeRec(); }
    };

    micRec.onend = function () {
      micActive = false; micRec = null;
      setMicBtnState(false);
      // Resume always-on listener
      if (wasWakeActive) setTimeout(function () { wakeActive = true; _rebuildWakeRec(); }, 500);
    };

    try {
      micRec.start();
    } catch (ex) {
      micActive = false; micRec = null;
      setMicBtnState(false);
      addMsg('bot', 'Could not start mic: ' + ex.message);
      if (wasWakeActive) { wakeActive = true; _rebuildWakeRec(); }
    }
  }

  // Detect Telugu Unicode (U+0C00–U+0C7F) and translate to English via Google
  function _maybeTranslate(text, callback) {
    if (!/[ఀ-౿]/.test(text)) {
      callback(text, null); // already English / Latin — no translation needed
      return;
    }
    setSt('Translating…');
    var url = 'https://translate.googleapis.com/translate_a/single' +
      '?client=gtx&sl=te&tl=en&dt=t&q=' + encodeURIComponent(text);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 6000;
    xhr.onload = function () {
      try {
        var data = JSON.parse(xhr.responseText);
        var eng = data[0].map(function (x) { return (x && x[0]) || ''; }).join('').trim();
        callback(eng || text, text); // (englishText, originalTelugu)
      } catch (e) {
        callback(text, null); // parse failed — try original as-is
      }
    };
    xhr.onerror = xhr.ontimeout = function () { callback(text, null); };
    xhr.send();
  }

  // Auto-process voice result (Telugu or English) — touchless flow
  function _processVoiceCommand(raw) {
    raw = (raw || '').trim();
    if (!raw) return;
    var inp = document.getElementById('alkraInput');
    if (inp) inp.value = '';

    // Show what was heard (Telugu label if translated later)
    addMsg('user', esc(raw));
    setSt('Online');

    // Translate if Telugu, then dispatch
    _maybeTranslate(raw, function (text, origTelugu) {
      // If translated, show the English interpretation as a hint
      if (origTelugu && text !== origTelugu) {
        addMsg('bot',
          '<small style="color:#6b7280">&#127470;&#127475; Translated: <i>' +
          esc(text) + '</i></small>'
        );
      }

      // "bye / close" — context-sensitive
      if (/^\s*(bye|goodbye|done|thanks?|thank\s*you)\s*$/i.test(text)) {
        showTyping(function () {
          addMsg('bot', 'Goodbye! &#128075;');
          setTimeout(window.alkraClose, 800);
        });
        return;
      }
      if (/^\s*(close|exit)\s*$/i.test(text)) {
        var detOv = document.getElementById('detailOverlay');
        var wOv   = document.getElementById('weightsOverlay');
        var sdpBg = document.querySelector('.sdp-popup-bg');
        if ((detOv && detOv.classList.contains('open')) ||
            (wOv && wOv.style.display !== 'none') || sdpBg) {
          showTyping(function () {
            dispatchAction({ type: 'closePopup', params: {} });
            addMsg('bot', '&#9989; Popup closed.<br><small style="color:#6b7280">Listening…</small>');
            setSt('Listening…');
            setTimeout(function () { isProcessing = false; }, 600);
          });
          return;
        }
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
          addMsg('bot', lines + '<br><small style="color:#6b7280">Done! Listening…</small>');
          setSt('Listening…');
          // wakeRec (always-on) resumes listening automatically
          setTimeout(function () { isProcessing = false; }, 800);
        } else {
          addMsg('bot',
            'I didn\'t catch that. &#129300;<br>' +
            '<small style="color:#6b7280">Speak in English, or press &#127908; for Telugu.</small>'
          );
          setSt('Listening…');
          setTimeout(function () { isProcessing = false; }, 1000);
        }
      });
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
    'batch 1990 to 2000', 'retiring 2026 to 2030', 'show all'
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
      if (e.key === 'Enter') {
        e.preventDefault();
        // Resume listening after typed command submitted
        listeningPaused = false;
        isProcessing = false;
        handleInput(input.value);
      }
    });
    // Pause voice listening while user is actively typing
    input.addEventListener('input', function () {
      if (!listeningPaused) {
        listeningPaused = true;
        isProcessing = true;
        setSt('Typing… (voice paused)');
      }
    });
    // Resume when input loses focus without submitting
    input.addEventListener('blur', function () {
      if (listeningPaused && !input.value.trim()) {
        listeningPaused = false;
        isProcessing = false;
        setSt('Listening…');
      }
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
      'Supports <b>English &amp; Telugu</b>. Always listening!<br>' +
      '<small style="color:#6b7280">' +
      '<b>Say "Alkra"</b> to open me · <b>"Alkra open Kumar"</b> for profile<br>' +
      '<b>"Alkra show service records"</b> · <b>"Alkra show 360 degree view"</b><br>' +
      '<b>"Alkra show department wise"</b> · <b>"Alkra close the chatbot"</b><br>' +
      'In 360 view: <b>"Alkra open CMO score"</b> · <b>"Alkra open e-office"</b>' +
      '</small>'
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

    // Bye / close — context-sensitive
    if (/^\s*(bye|goodbye|done|thanks?|thank\s*you)\s*$/i.test(text)) {
      showTyping(function () {
        addMsg('bot', 'Goodbye! Click the button anytime to come back. &#128075;');
        setTimeout(window.alkraClose, 900);
      });
      return;
    }
    if (/^\s*(close|exit)\s*$/i.test(text)) {
      var detOvH = document.getElementById('detailOverlay');
      var wOvH   = document.getElementById('weightsOverlay');
      var sdpBgH = document.querySelector('.sdp-popup-bg');
      if ((detOvH && detOvH.classList.contains('open')) ||
          (wOvH && wOvH.style.display !== 'none') || sdpBgH) {
        showTyping(function () {
          dispatchAction({ type: 'closePopup', params: {} });
          addMsg('bot', '&#9989; Popup closed.<br><small style="color:#6b7280">Anything else?</small>');
          if (inp) inp.focus();
        });
        return;
      }
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
    return '<b>Commands I understand:</b><br>' +
      '<b>Open</b> — "open Kumar" → opens officer profile popup<br>' +
      '<b>Close</b> — "close" → closes the open popup<br>' +
      '<b>Show all</b> — resets all filters<br>' +
      '<b>Cadre</b> — "Principal Secretary", "Chief Secretary"…<br>' +
      '<b>Source</b> — "direct recruit", "promoted"<br>' +
      '<b>Domicile</b> — "Andhra Pradesh", "Telangana"…<br>' +
      '<b>Post Type</b> — any post type name<br>' +
      '<b>Batch</b> — "batch 1990 to 2000"<br>' +
      '<b>Retiring</b> — "retiring 2026 to 2028"<br>' +
      '<b>Sort</b> — "sort by CMO score descending"<br>' +
      '<b>Service</b> — "IAS" / "IPS" / "IFS"<br>' +
      '<b>Search</b> — "search Kumar"<br>' +
      '<b>Telugu</b> — speak in Telugu, auto-translated &#127470;&#127475;→&#127468;&#127463;<br>' +
      '<small style="color:#92400e">Say <b>"Alkra"</b> to wake → speak in English or Telugu — fully hands-free!</small>';
  }

  // ── Open / close ──────────────────────────────────────────────
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    // wakeRec keeps running — it switches to command mode when isOpen=true
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.add('open');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.add('open');
    setSt('Listening…');
    // Don't auto-focus input — chatbot is voice-first; click input to type
  }

  window.alkraClose = function () {
    isOpen = false;
    isProcessing = false;
    listeningPaused = false;
    // Stop any in-progress manual mic or speech
    if (micActive && micRec) { try { micRec.abort(); } catch (e) {} micRec = null; micActive = false; }
    if (SS) SS.cancel();
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.remove('open', 'listening', 'typing');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.remove('open', 'listening');
    setSt('Filter Assistant');
    // wakeRec is always-on — if it somehow stopped, restart it
    if (!wakeActive) setTimeout(startWakeListener, 400);
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
    // Start always-on listener immediately — prompts mic permission on first load
    setTimeout(startWakeListener, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
