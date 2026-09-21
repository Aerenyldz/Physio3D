import { PATHOLOGIES_DATABASE } from '../data/pathologies.js';

/**
 * Region + slang aliases (already ASCII-folded forms work too via fold()).
 * "gogus" / "göğüs" → Omuz (pektoralis)
 */
const REGION_ALIASES = {
  Boyun: [
    'boyun', 'ense', 'servikal', 'boyunum', 'nuchal', 'text neck',
    'boyun fitigi', 'fitik boyun', 'boynum',
  ],
  Omuz: [
    'omuz', 'omzum', 'rotator', 'cuff', 'skapula', 'frozen', 'donuk omuz',
    'gogus', 'göğüs', 'goks', 'pektoral', 'pektoralis', 'pec', 'chest',
    'gogus kas', 'omzum agriyor', 'ac eklem', 'kostokondrit', 'skapular',
  ],
  Dirsek: [
    'dirsek', 'dirsegim', 'epikondil', 'tenisci', 'golfcu', 'tenisci dirsegi',
    'olekranon',
  ],
  'El Bileği': [
    'el bilegi', 'bilek', 'karpal', 'de quervain', 'basparmak', 'elbilegi',
    'el agrisi', 'el uyusmasi', 'tetik parmak', 'trigger',
  ],
  Bel: [
    'bel', 'belim', 'lomber', 'bel fitigi', 'sirt alt', 'bel agrisi', 'belim agriyor',
    'bel kas', 'lomber kas', 'faset', 'karın', 'karin', 'rektus',
  ],
  Sırt: [
    'sirt', 'sirtim', 'lat', 'latissimus', 'kanat kas', 'romboid', 'rhomboid',
    'orta sirt', 'skapula arka', 'sirt agrisi', 'torakal', 'midback', 'upper back',
  ],
  Pelvis: [
    'pelvis', 'kalca kemigi', 'piriformis', 'siyatik', 'yalancı siyatik',
    'sakroiliak', 'si eklem', 'si joint',
  ],
  Kalça: [
    'kalca', 'kalcam', 'trokanter', 'fai', 'asetabulum', 'kalca agrisi',
    'itb', 'ilyotibiyal', 'hamstring', 'uyluk arka', 'kasik', 'adductor',
  ],
  Diz: [
    'diz', 'dizim', 'meniskus', 'acl', 'patella', 'on capraz', 'kosucu dizi',
    'diz agrisi', 'dizim agriyor', 'mcl', 'ic yan bag', 'patellar', 'jumper',
  ],
  'Ayak Bileği': [
    'ayak bilegi', 'bilek burkulma', 'atfl', 'asil', 'achilles', 'ayakbilegi',
    'burkulma', 'baldır', 'baldir', 'gastrocnemius', 'kaval', 'shin', 'peroneal',
  ],
  Ayak: [
    'ayak', 'ayagim', 'plantar', 'topuk', 'fasciit', 'fasit', 'topuk dikeni',
    'morton',
  ],
};

/** Extra free-text → region (common typos / slang) */
const EXTRA_ALIASES = [
  { region: 'Omuz', words: ['gogus', 'göğüs', 'goks', 'pectoral', 'pecs', 'biseps', 'biceps'] },
  { region: 'Boyun', words: ['ense', 'boyunfitigi', 'servikal', 'trapez'] },
  { region: 'Bel', words: ['belfitigi', 'lomberfitik'] },
  { region: 'Sırt', words: ['lat', 'latissimus', 'romboid', 'rhomboid', 'kanat'] },
  { region: 'Diz', words: ['menisk', 'oncapraz', 'caprazbag', 'mcl'] },
];

function fold(text) {
  return (text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein distance — short words only */
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
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[a.length][b.length];
}

function maxEdits(wordLen) {
  if (wordLen <= 3) return 0;
  if (wordLen <= 5) return 1;
  if (wordLen <= 8) return 2;
  return 2;
}

function fuzzyIncludes(haystack, needle) {
  if (!needle) return false;
  if (haystack.includes(needle)) return true;

  // Token-level fuzzy: "gogus" ≈ "gogus" in "gogus kas"
  const tokens = haystack.split(/\s+/);
  const nLen = needle.length;
  const allowed = maxEdits(nLen);
  if (allowed === 0) return false;

  return tokens.some((t) => {
    if (Math.abs(t.length - nLen) > allowed) return false;
    return editDistance(t, needle) <= allowed;
  });
}

function fuzzyTokenMatch(token, vocabulary) {
  const t = fold(token);
  if (t.length < 3) return null;

  let best = null;
  for (const word of vocabulary) {
    const w = fold(word);
    if (!w) continue;
    if (w === t || w.includes(t) || t.includes(w)) {
      return { word: w, distance: 0 };
    }
    const allowed = maxEdits(Math.max(t.length, w.length));
    if (allowed === 0) continue;
    if (Math.abs(w.length - t.length) > allowed) continue;
    const dist = editDistance(t, w);
    if (dist <= allowed && (!best || dist < best.distance)) {
      best = { word: w, distance: dist };
    }
  }
  return best;
}

function buildVocabulary() {
  const vocab = new Set();
  Object.keys(REGION_ALIASES).forEach((r) => vocab.add(fold(r)));
  Object.values(REGION_ALIASES).forEach((list) => {
    list.forEach((a) => fold(a).split(/\s+/).forEach((p) => p.length >= 3 && vocab.add(p)));
  });
  EXTRA_ALIASES.forEach((e) => e.words.forEach((w) => vocab.add(fold(w))));
  // Pathology keywords
  PATHOLOGIES_DATABASE.forEach((p) => {
    fold(p.title).split(/\s+/).forEach((t) => t.length >= 4 && vocab.add(t));
    fold(p.region).split(/\s+/).forEach((t) => t.length >= 3 && vocab.add(t));
  });
  return [...vocab];
}

const VOCABULARY = buildVocabulary();

export class FilterEngine {
  constructor(pathologies = PATHOLOGIES_DATABASE) {
    this.pathologies = pathologies;
  }

  filter(activeFilter) {
    const visibleIds = new Set();
    let visibleCount = 0;

    this.pathologies.forEach((p) => {
      const matchRegion = activeFilter.region === 'all' || p.region === activeFilter.region;
      const matchSeverity = activeFilter.severity === 'all' || p.severity === activeFilter.severity;
      const matchCategory = activeFilter.category === 'all' || p.category === activeFilter.category;

      if (matchRegion && matchSeverity && matchCategory) {
        visibleIds.add(p.id);
        visibleCount++;
      }
    });

    return { visibleIds, visibleCount };
  }

  /**
   * Detect region with aliases + fuzzy typos.
   * Returns { region, corrected, suggestion } or null fields.
   */
  detectRegion(query) {
    const q = fold(query);
    if (!q) return { region: null, corrected: null, suggestion: null };

    // 1) Direct / alias includes
    for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
      const foldedRegion = fold(region);
      const all = [foldedRegion, ...aliases.map(fold)];
      if (all.some((a) => a && (q.includes(a) || a.includes(q)))) {
        return { region, corrected: null, suggestion: region };
      }
    }

    for (const extra of EXTRA_ALIASES) {
      if (extra.words.some((w) => q.includes(fold(w)))) {
        return { region: extra.region, corrected: fold(extra.words[0]), suggestion: extra.region };
      }
    }

    // 2) Fuzzy per token
    const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
    for (const token of tokens) {
      // Against region names + aliases
      for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
        const pool = [fold(region), ...aliases.map(fold)];
        const hit = fuzzyTokenMatch(token, pool);
        if (hit && hit.distance <= maxEdits(token.length)) {
          return {
            region,
            corrected: hit.word,
            suggestion: region,
          };
        }
      }
    }

    // 3) Fuzzy against global vocab → map back to region if possible
    for (const token of tokens) {
      const hit = fuzzyTokenMatch(token, VOCABULARY);
      if (!hit || hit.distance === 0) continue;
      for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
        const pool = [fold(region), ...aliases.map(fold)];
        if (pool.some((a) => a === hit.word || a.includes(hit.word) || hit.word.includes(a))) {
          return { region, corrected: hit.word, suggestion: region };
        }
      }
    }

    return { region: null, corrected: null, suggestion: null };
  }

  /**
   * Free-text search with Turkish fold + typo tolerance.
   */
  search(query) {
    const q = fold(query);
    const visibleIds = new Set();
    const ranked = [];

    if (!q) {
      this.pathologies.forEach((p) => visibleIds.add(p.id));
      return {
        visibleIds,
        visibleCount: this.pathologies.length,
        ranked: [...this.pathologies],
        detectedRegion: null,
        corrected: null,
        suggestion: null,
      };
    }

    const detected = this.detectRegion(query);
    const detectedRegion = detected.region;

    // Corrected query tokens for scoring
    const stop = new Set(['agr', 'agri', 'agriyor', 'var', 'icin', 'gibi', 'benim', 'bir', 'cok']);
    const rawTokens = q.split(/\s+/).filter((t) => t.length > 2 && !stop.has(t));
    const tokens = rawTokens.map((t) => {
      const hit = fuzzyTokenMatch(t, VOCABULARY);
      return hit && hit.distance > 0 ? hit.word : t;
    });

    this.pathologies.forEach((p) => {
      if (detectedRegion && p.region !== detectedRegion) return;

      let score = 0;
      const title = fold(p.title);
      const latin = fold(p.latinName);
      const region = fold(p.region);
      const desc = fold(p.description);
      const symptoms = (p.symptoms || []).map(fold).join(' ');
      const structures = (p.affectedStructures || []).map(fold).join(' ');
      const category = fold(p.category);
      const blob = `${title} ${latin} ${region} ${desc} ${symptoms} ${structures} ${category}`;

      if (detectedRegion && p.region === detectedRegion) score += 40;
      if (region === q || title === q) score += 50;
      if (fuzzyIncludes(title, q) || title.includes(q)) score += 30;
      if (fuzzyIncludes(latin, q) || latin.includes(q)) score += 20;
      if (fuzzyIncludes(region, q) || region.includes(q)) score += 25;
      if (fuzzyIncludes(symptoms, q) || symptoms.includes(q)) score += 18;
      if (fuzzyIncludes(structures, q) || structures.includes(q)) score += 12;
      if (desc.includes(q)) score += 8;
      if (category.includes(q)) score += 6;

      tokens.forEach((t) => {
        if (fuzzyIncludes(blob, t) || blob.includes(t)) score += 10;
        if (fuzzyIncludes(title, t) || title.includes(t)) score += 8;
        if (fuzzyIncludes(region, t) || region.includes(t)) score += 12;
      });

      if (detectedRegion && tokens.length === 0 && score === 40) {
        score += 5;
      }

      if (score > 0) {
        visibleIds.add(p.id);
        ranked.push({ pathology: p, score });
      }
    });

    ranked.sort((a, b) => b.score - a.score);

    return {
      visibleIds,
      visibleCount: visibleIds.size,
      ranked: ranked.map((r) => r.pathology),
      detectedRegion,
      bestMatch: ranked[0]?.pathology || null,
      corrected: detected.corrected,
      suggestion: detected.suggestion,
    };
  }

  getByRegion(region) {
    return this.filter({ region, severity: 'all', category: 'all' });
  }

  getBySeverity(severity) {
    return this.filter({ region: 'all', severity, category: 'all' });
  }

  getByCategory(category) {
    return this.filter({ region: 'all', severity: 'all', category });
  }
}
