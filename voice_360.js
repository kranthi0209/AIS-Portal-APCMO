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

  var SR       = window.SpeechRecognition || window.webkitSpeechRecognition;
  var isOpen   = false;
  var micRec   = null;
  var micActive = false;

  // ── Cat face SVG  (realistic golden tabby) ───────────────────
  var CAT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" style="display:block">' +

    // ── Ears (drawn first so face covers their base) ───────────
    '<g class="cat-ear-l">' +
      // Outer ear — curved organic shape
      '<path d="M 19 43 Q 5 14 21 6 Q 35 1 38 30" fill="#b45309"/>' +
      // Inner ear — lighter warm fur + pink skin
      '<path d="M 21 41 Q 10 18 22 11 Q 33 7 35 30" fill="#fde68a" opacity="0.7"/>' +
      '<path d="M 22 40 Q 12 20 23 13 Q 31 9 33 30" fill="#fda4af" opacity="0.85"/>' +
    '</g>' +
    '<g class="cat-ear-r">' +
      '<path d="M 81 43 Q 95 14 79 6 Q 65 1 62 30" fill="#b45309"/>' +
      '<path d="M 79 41 Q 90 18 78 11 Q 67 7 65 30" fill="#fde68a" opacity="0.7"/>' +
      '<path d="M 78 40 Q 88 20 77 13 Q 69 9 67 30" fill="#fda4af" opacity="0.85"/>' +
    '</g>' +

    // ── Face base ─────────────────────────────────────────────
    // Head — slightly pear shaped (wider cheeks)
    '<ellipse cx="50" cy="56" rx="37" ry="34" fill="#f59e0b"/>' +
    // Subtle warm shadow on temples & top
    '<ellipse cx="50" cy="37" rx="28" ry="14" fill="#c27803" opacity="0.32"/>' +
    // Lighter chin/lower face
    '<ellipse cx="50" cy="74" rx="24" ry="13" fill="#fde68a" opacity="0.6"/>' +
    // Whisker-pad muzzle bumps
    '<ellipse cx="34" cy="68" rx="11" ry="8.5" fill="#fef3c7" opacity="0.55"/>' +
    '<ellipse cx="66" cy="68" rx="11" ry="8.5" fill="#fef3c7" opacity="0.55"/>' +

    // ── Tabby markings ────────────────────────────────────────
    // Classic M on forehead
    '<path d="M 39 33 Q 42.5 28 46 33 Q 50 27 54 33 Q 57.5 28 61 33"' +
      ' stroke="#92400e" stroke-width="1.9" fill="none" stroke-linecap="round" opacity="0.7"/>' +
    // Vertical brow stripes
    '<path d="M 43 36 C 42 39 42 42 43 46" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.45"/>' +
    '<path d="M 50 35 L 50 46"              stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.45"/>' +
    '<path d="M 57 36 C 58 39 58 42 57 46" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.45"/>' +
    // Cheek stripes (short diagonal)
    '<path d="M 20 54 Q 25 50 27 56" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.4"/>' +
    '<path d="M 18 63 Q 23 60 25 65" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.4"/>' +
    '<path d="M 80 54 Q 75 50 73 56" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.4"/>' +
    '<path d="M 82 63 Q 77 60 75 65" stroke="#92400e" stroke-width="1.3" fill="none" opacity="0.4"/>' +

    // ── Left eye (almond shaped using path) ────────────────────
    '<g class="cat-eye-l">' +
      // Eye socket shadow
      '<ellipse cx="35" cy="50" rx="12" ry="9.5" fill="#7c2d12" opacity="0.3"/>' +
      // Iris — almond shape
      '<path d="M 25 50 Q 28 42 35 42 Q 42 42 45 50 Q 42 58 35 58 Q 28 58 25 50 Z" fill="#16a34a"/>' +
      // Depth ring
      '<path d="M 27.5 50 Q 30 44.5 35 44.5 Q 40 44.5 42.5 50 Q 40 55.5 35 55.5 Q 30 55.5 27.5 50 Z"' +
        ' fill="#14532d" opacity="0.5"/>' +
      // Vertical slit pupil
      '<path d="M 33.2 43 Q 31.5 50 33.2 57 Q 35 59 36.8 57 Q 38.5 50 36.8 43 Q 35 41 33.2 43 Z"' +
        ' fill="#0c0a09"/>' +
      // Upper lid crease (heaviness = realism)
      '<path d="M 25 50 Q 28 42 35 42 Q 42 42 45 50"' +
        ' stroke="#3b1a02" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>' +
      // Primary shine dot
      '<ellipse cx="30.5" cy="45.5" rx="2.8" ry="2.2" fill="white" opacity="0.92"/>' +
      // Secondary small shine
      '<circle cx="37.5" cy="47.5" r="1.3" fill="white" opacity="0.5"/>' +
    '</g>' +

    // ── Right eye ──────────────────────────────────────────────
    '<g class="cat-eye-r">' +
      '<ellipse cx="65" cy="50" rx="12" ry="9.5" fill="#7c2d12" opacity="0.3"/>' +
      '<path d="M 55 50 Q 58 42 65 42 Q 72 42 75 50 Q 72 58 65 58 Q 58 58 55 50 Z" fill="#16a34a"/>' +
      '<path d="M 57.5 50 Q 60 44.5 65 44.5 Q 70 44.5 72.5 50 Q 70 55.5 65 55.5 Q 60 55.5 57.5 50 Z"' +
        ' fill="#14532d" opacity="0.5"/>' +
      '<path d="M 63.2 43 Q 61.5 50 63.2 57 Q 65 59 66.8 57 Q 68.5 50 66.8 43 Q 65 41 63.2 43 Z"' +
        ' fill="#0c0a09"/>' +
      '<path d="M 55 50 Q 58 42 65 42 Q 72 42 75 50"' +
        ' stroke="#3b1a02" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>' +
      '<ellipse cx="60.5" cy="45.5" rx="2.8" ry="2.2" fill="white" opacity="0.92"/>' +
      '<circle cx="67.5" cy="47.5" r="1.3" fill="white" opacity="0.5"/>' +
    '</g>' +

    // ── Nose (heart-shaped leather) ────────────────────────────
    '<path d="M 50 63 Q 47.5 65 46.5 67.5 Q 48.5 70 50 69 Q 51.5 70 53.5 67.5 Q 52.5 65 50 63 Z"' +
      ' fill="#ec4899"/>' +
    // Nose bridge highlight
    '<path d="M 49 63.5 Q 50 62.5 51 63.5" stroke="#fda4af" stroke-width="0.8" fill="none" opacity="0.7"/>' +
    // Nostril hints
    '<path d="M 48 65.5 Q 47 66.5 47.2 67.5" stroke="#be185d" stroke-width="0.8" fill="none" opacity="0.55"/>' +
    '<path d="M 52 65.5 Q 53 66.5 52.8 67.5" stroke="#be185d" stroke-width="0.8" fill="none" opacity="0.55"/>' +

    // ── Philtrum + mouth ──────────────────────────────────────
    '<line x1="50" y1="69" x2="50" y2="73" stroke="#7c2d12" stroke-width="1" opacity="0.65"/>' +
    '<path d="M 50 73 Q 45.5 77.5 42 75.5" stroke="#7c2d12" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M 50 73 Q 54.5 77.5 58 75.5" stroke="#7c2d12" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +

    // ── Whiskers left ──────────────────────────────────────────
    '<g class="cat-wl">' +
      '<line x1="43" y1="64" x2="5"  y2="57" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      '<line x1="43" y1="67" x2="5"  y2="67" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      '<line x1="43" y1="70" x2="5"  y2="77" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      // Short inner accent whiskers
      '<line x1="43" y1="65.5" x2="26" y2="62" stroke="#3b1a02" stroke-width="0.7" opacity="0.35"/>' +
    '</g>' +

    // ── Whiskers right ─────────────────────────────────────────
    '<g class="cat-wr">' +
      '<line x1="57" y1="64" x2="95" y2="57" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      '<line x1="57" y1="67" x2="95" y2="67" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      '<line x1="57" y1="70" x2="95" y2="77" stroke="#3b1a02" stroke-width="1"   opacity="0.6"/>' +
      '<line x1="57" y1="65.5" x2="74" y2="62" stroke="#3b1a02" stroke-width="0.7" opacity="0.35"/>' +
    '</g>' +

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

  function startMicInput() {
    if (!SR) {
      addMsg('bot', 'Voice input needs Chrome or Edge browser.');
      return;
    }
    // Second click cancels
    if (micActive && micRec) { micRec.abort(); return; }

    micRec = new SR();
    micRec.lang            = 'en-IN';
    micRec.continuous      = false;
    micRec.interimResults  = true;   // show words forming in real-time
    micRec.maxAlternatives = 1;

    micRec.onstart = function () {
      micActive = true;
      setMicBtnState(true);
      var inp = document.getElementById('alkraInput');
      if (inp) inp.value = '';
    };

    micRec.onresult = function (ev) {
      var result     = ev.results[ev.results.length - 1];
      var transcript = result[0].transcript;
      var inp = document.getElementById('alkraInput');
      if (inp) inp.value = transcript;          // show text as it forms
      if (result.isFinal) {
        // Done — user reviews the text and presses Enter themselves
        micActive = false;
        micRec    = null;
        setMicBtnState(false);
        if (inp) inp.focus();
      }
    };

    micRec.onerror = function (ev) {
      micActive = false;
      micRec    = null;
      setMicBtnState(false);
      if (ev.error === 'not-allowed') {
        addMsg('bot', '&#128274; Mic blocked — click the lock icon in your browser address bar and allow microphone.');
      } else if (ev.error === 'network') {
        addMsg('bot', '&#127760; No network — voice input needs an internet connection.');
      } else if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
        addMsg('bot', 'Mic error: ' + ev.error + '. Please type instead.');
      }
    };

    micRec.onend = function () {
      micActive = false;
      micRec    = null;
      setMicBtnState(false);
    };

    try {
      micRec.start();
    } catch (ex) {
      micActive = false; micRec = null;
      setMicBtnState(false);
      addMsg('bot', 'Could not start mic: ' + ex.message);
    }
  }

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
      'Hello! &#128075; I can filter and sort the officer list.<br>' +
      '<small style="color:#6b7280">Type a command or tap a suggestion above.</small>'
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
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.add('open');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.add('open');
    setSt('Online');
    // Focus input after animation
    setTimeout(function () {
      var inp = document.getElementById('alkraInput');
      if (inp) inp.focus();
    }, 300);
  }

  window.alkraClose = function () {
    isOpen = false;
    var panel = document.getElementById('alkraPanel');
    if (panel) panel.classList.remove('open');
    var fab = document.getElementById('alkraBtn');
    if (fab) fab.classList.remove('open');
    setSt('Filter Assistant');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }

})();
