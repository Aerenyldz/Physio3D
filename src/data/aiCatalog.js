/**
 * Region detection + arm-limb grouping for AI catalog scoping.
 * Typo-tolerant: ASCII-fold + fuzzy token match against anatomy keywords.
 */

const FOLD_MAP = { ğ: 'g', ü: 'u', ş: 's', ö: 'o', ç: 'c', ı: 'i', İ: 'i' };

export function fold(text) {
  return (text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ğüşöçıİ]/g, (c) => FOLD_MAP[c] || c)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[a.length][b.length];
}

function maxEdits(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  return 2;
}

/** Common Turkish anatomy / symptom misspellings → canonical (folded) form. */
const COMMON_FIXES = {
  omzum: 'omuz',
  omzuma: 'omuz',
  omzumda: 'omuz',
  omu: 'omuz',
  omz: 'omuz',
  sirtim: 'sirt',
  sirtima: 'sirt',
  sirtimda: 'sirt',
  belim: 'bel',
  belime: 'bel',
  belimde: 'bel',
  dizim: 'diz',
  dizime: 'diz',
  dizimde: 'diz',
  kalcam: 'kalca',
  kalcama: 'kalca',
  boyunum: 'boyun',
  boynum: 'boyun',
  dirsegim: 'dirsek',
  dirsegime: 'dirsek',
  bilegim: 'bilek',
  elbilegim: 'el bilegi',
  agriyo: 'agriyor',
  agriyor: 'agriyor',
  agry: 'agriyor',
  agri: 'agri',
  gogusum: 'gogus',
  gogsum: 'gogus',
  goks: 'gogus',
  latisim: 'latissimus',
  latisimus: 'latissimus',
  latissmus: 'latissimus',
  romboid: 'rhomboid',
  meniskus: 'meniskus',
  menisk: 'meniskus',
  asilim: 'asil',
  achiles: 'achilles',
  karinim: 'karin',
  karnim: 'karin',
  karnım: 'karin',
  kasım: 'kas',
  kasim: 'kas',
  ustu: 'ust',
  ustunde: 'ust',
  altinda: 'alt',
  icinde: 'ic',
  disinda: 'dis',
  kolum: 'kol',
  koluma: 'kol',
  kolumda: 'kol',
};

/**
 * Soft-correct user text for the model (keeps meaning, fixes common typos).
 * Returns { original, normalized, hint }.
 */
export function normalizeComplaint(text) {
  const original = (text || '').trim();
  const f = fold(original);
  if (!f) return { original, normalized: '', hint: '' };

  const tokens = f.split(/\s+/);
  const fixed = tokens.map((t) => {
    if (COMMON_FIXES[t]) return COMMON_FIXES[t];
    // possessive / suffix stripping for short anatomy words
    for (const [wrong, right] of Object.entries(COMMON_FIXES)) {
      if (t.startsWith(wrong) && t.length - wrong.length <= 3) return right;
    }
    return t;
  });

  const normalized = fixed.join(' ');
  const hint =
    normalized !== f
      ? `Yazım düzeltilmiş okuma (anlam için): "${normalized}"`
      : '';

  return { original, normalized, hint };
}

function tokenMatchesKeyword(token, keyword) {
  const t = fold(token);
  const k = fold(keyword);
  if (!t || !k) return false;
  if (t === k || t.includes(k) || k.includes(t)) return true;
  if (Math.abs(t.length - k.length) > maxEdits(Math.max(t.length, k.length))) return false;
  return editDistance(t, k) <= maxEdits(Math.max(t.length, k.length));
}

function textHitsKeyword(foldedText, keyword) {
  const k = fold(keyword);
  if (!k) return false;
  if (foldedText.includes(k)) return true;
  const tokens = foldedText.split(/\s+/).filter((t) => t.length >= 3);
  return tokens.some((t) => tokenMatchesKeyword(t, k));
}

/** Keywords → body region (Physio3D regions). */
const REGION_KEYWORDS = {
  Boyun: ['boyun', 'ense', 'servikal', 'whiplash', 'scm'],
  Omuz: [
    'omuz', 'rotator', 'cuff', 'skapula', 'scapula', 'gogus', 'pektoral', 'pec',
    'ac eklem', 'akromiyon', 'kostokondrit', 'biseps', 'biceps', 'donuk',
  ],
  Dirsek: ['dirsek', 'epikondil', 'tenisci', 'golfcu', 'olekranon', 'bursit dirsek'],
  'El Bileği': [
    'el bilegi', 'bilek', 'karpal', 'de quervain', 'tetik parmak', 'trigger',
    'tfcc', 'parmak', 'el agrisi',
  ],
  Bel: ['bel', 'lomber', 'faset', 'karin', 'rektus', 'abdominal'],
  Sırt: ['sirt', 'lat', 'latissimus', 'romboid', 'rhomboid', 'torakal', 'kanat'],
  Pelvis: ['pelvis', 'piriformis', 'sakroiliak', 'siyatik', 'si eklem'],
  Kalça: ['kalca', 'trokanter', 'fai', 'adductor', 'kasik', 'hamstring', 'itb', 'ilyotibiyal'],
  Diz: ['diz', 'menisk', 'meniskus', 'acl', 'mcl', 'patella', 'patellar', 'jumper'],
  'Ayak Bileği': [
    'ayak bilegi', 'atfl', 'asil', 'achilles', 'baldir', 'peroneal',
    'fibularis', 'kaval', 'shin', 'burkulma',
  ],
  Ayak: ['ayak', 'plantar', 'topuk', 'morton', 'metatars'],
};

/** “Kol” → upper limb regions (demo focus). */
const LIMB_GROUPS = {
  kol: ['Omuz', 'Dirsek', 'El Bileği'],
  arm: ['Omuz', 'Dirsek', 'El Bileği'],
  ustekstremite: ['Omuz', 'Dirsek', 'El Bileği'],
};

/**
 * Detect likely regions from free text (complaint + chat history).
 * Tolerates typos via fold + fuzzy token match.
 * @returns {string[]} unique region names
 */
export function detectLikelyRegions(text) {
  const { normalized } = normalizeComplaint(text);
  const f = normalized || fold(text);
  if (!f) return [];

  const hit = new Set();

  for (const [limbKey, regions] of Object.entries(LIMB_GROUPS)) {
    if (textHitsKeyword(f, limbKey)) {
      regions.forEach((r) => hit.add(r));
    }
  }
  if (/\bkol(um|un|una|umu|mda|ma)?\b/.test(f) || textHitsKeyword(f, 'kol')) {
    LIMB_GROUPS.kol.forEach((r) => hit.add(r));
  }

  for (const [region, words] of Object.entries(REGION_KEYWORDS)) {
    if (words.some((w) => textHitsKeyword(f, w))) {
      hit.add(region);
    }
  }

  return [...hit];
}

/**
 * Extract what the user already answered so we don't re-ask.
 * @returns {{ side?: string, height?: string, depth?: string, notes: string[] }}
 */
export function extractClarifyFacts(text) {
  const f = fold(text);
  const facts = { notes: [] };

  if (!f) return facts;

  if (
    /\b(her\s*iki|ikisi|iki\s*taraf|bilateral|both)\b/.test(f) ||
    /\bher\s*iki\s*taraf/.test(f)
  ) {
    facts.side = 'both';
    facts.notes.push('yan: her iki taraf');
  } else if (/\b(sol|solda|solum|left)\b/.test(f)) {
    facts.side = 'left';
    facts.notes.push('yan: sol');
  } else if (/\b(sag|sagda|sagim|right)\b/.test(f)) {
    facts.side = 'right';
    facts.notes.push('yan: sağ');
  }

  if (/\b(ust|yukari|ense|ustunde|ustu)\b/.test(f)) {
    facts.height = 'upper';
    facts.notes.push('seviye: üst');
  } else if (/\b(alt|asagi|altinda|bel\s*hiza)\b/.test(f)) {
    facts.height = 'lower';
    facts.notes.push('seviye: alt');
  } else if (/\b(orta|ortasi|mid)\b/.test(f)) {
    facts.height = 'mid';
    facts.notes.push('seviye: orta');
  }

  if (/\b(on|onde|gogus|ic|ice|medial)\b/.test(f)) {
    facts.depth = 'front_inner';
    facts.notes.push('yüz: ön/iç');
  } else if (/\b(arka|arkada|dis|yan|lateral|kanat|lat)\b/.test(f)) {
    facts.depth = 'back_outer';
    facts.notes.push('yüz: arka/dış');
  }

  return facts;
}

/**
 * Build catalog payload for the LLM: prefer scoped regions, else all grouped.
 */
export function buildScopedCatalogPayload(getCatalogGroupedByRegion, regions) {
  const grouped = getCatalogGroupedByRegion(regions?.length ? regions : undefined);
  const regionCount = Object.keys(grouped).length;
  const total = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
  return {
    scoped: Boolean(regions?.length),
    regions: regions || Object.keys(grouped),
    regionCount,
    total,
    byRegion: grouped,
  };
}
