import { getPathologyCatalogForAI, getCatalogGroupedByRegion } from '../data/pathologies.js';
import { SOHBET_SYSTEM_PROMPT } from '../data/fizikoPrompts.js';
import { detectLikelyRegions, buildScopedCatalogPayload, normalizeComplaint, fold, extractClarifyFacts } from '../data/aiCatalog.js';


const DEFAULT_MODEL = 'qwen3:8b';
const OLLAMA_BASE = '/api/ollama';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    pathologyIds: {
      type: 'array',
      items: { type: 'string' },
    },
    region: { type: 'string' },
    confidence: { type: 'number' },
    rationale: { type: 'string' },
  },
  required: ['pathologyIds', 'region', 'confidence', 'rationale'],
};

const CHAT_SCHEMA = {
  type: 'object',
  properties: {
    phase: { type: 'string' },
    message: { type: 'string' },
    choices: {
      type: 'array',
      items: { type: 'string' },
    },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          why: { type: 'string' },
        },
        required: ['id', 'label', 'why'],
      },
    },
    region: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['phase', 'message', 'choices', 'options', 'region', 'confidence'],
};

/**
 * Local (offline) Fiziko AI via Ollama — no cloud APIs.
 */
export class PainAnalyzer {
  constructor(pathologies, options = {}) {
    this.pathologies = pathologies || [];
    this.validIds = new Set(this.pathologies.map((p) => p.id));
    this.validRegions = new Set(this.pathologies.map((p) => p.region));
    this.model = options.model || DEFAULT_MODEL;
    this.baseUrl = options.baseUrl || OLLAMA_BASE;
    this.timeoutMs = options.timeoutMs || 90000;
    this._available = null;
  }

  async checkAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) {
        this._available = false;
        return false;
      }
      const data = await res.json();
      const names = (data.models || []).map((m) => m.name);
      this._available = names.some(
        (n) => n === this.model || n.startsWith(`${this.model}:`) || n.startsWith('qwen3')
      );
      if (!this._available && names.length) {
        const qwen = names.find((n) => n.startsWith('qwen3'));
        if (qwen) {
          this.model = qwen;
          this._available = true;
        }
      }
      return this._available;
    } catch {
      this._available = false;
      return false;
    }
  }

  async analyze(query) {
    const q = (query || '').trim();
    if (q.length < 3) return null;

    if (this._available === null) await this.checkAvailable();
    if (!this._available) return { ok: false, reason: 'offline', source: 'none' };

    const catalog = getPathologyCatalogForAI();
    const system = [
      'Sen bir fizyoterapi anatomi asistanısın.',
      'Kullanıcının Türkçe ağrı/şikayet tarifini oku.',
      'SADECE verilen patoloji kataloğundaki id değerlerini seç.',
      'Klinik teşhis koyma; olası eşleşmeleri sırala (en olası önce, max 5).',
      'region alanı katalogdaki bölge adlarından biri olmalı.',
      'confidence 0-1 arası olsun.',
      'Yanıtı yalnızca JSON olarak ver.',
    ].join(' ');

    const user = [
      `Şikayet: "${q}"`,
      '',
      'Katalog (JSON):',
      JSON.stringify(catalog),
      '',
      'Örnek: "sırtımın lat kısmının biraz üstü ağrıyor" → back_latissimus_strain, region Sırt',
    ].join('\n');

    const parsed = await this._chatJson({
      system,
      user,
      schema: RESPONSE_SCHEMA,
      numPredict: 256,
    });

    if (!parsed.ok) return parsed;

    const data = parsed.data;
    const pathologyIds = (data.pathologyIds || [])
      .filter((id) => this.validIds.has(id))
      .slice(0, 5);

    let region = data.region;
    if (!this.validRegions.has(region)) {
      region = pathologyIds.length
        ? this.pathologies.find((p) => p.id === pathologyIds[0])?.region
        : null;
    }

    if (!pathologyIds.length) {
      return { ok: false, reason: 'no_match', source: 'ai', rationale: data.rationale };
    }

    return {
      ok: true,
      source: 'ai',
      model: this.model,
      pathologyIds,
      region: region || null,
      confidence: clamp01(data.confidence),
      rationale: String(data.rationale || '').slice(0, 240),
    };
  }

  /**
   * Physio AI Sohbet: multi-turn clarify → 2–3 pathology options.
   * Catalog is region-scoped when the complaint implies a body area.
   */
  async chatAnalyze(query, { history = [] } = {}) {
    const q = (query || '').trim();
    if (q.length < 2) return { ok: false, reason: 'empty' };

    if (this._available === null) await this.checkAvailable();
    if (!this._available) return { ok: false, reason: 'offline' };

    const historyText = history.map((m) => m.content).join(' ');
    const norm = normalizeComplaint(q);
    const blobForRegion = `${historyText} ${norm.normalized || q}`;
    const likelyRegions = detectLikelyRegions(blobForRegion);
    const facts = extractClarifyFacts(`${historyText} ${norm.normalized || q}`);

    const catalogPayload = buildScopedCatalogPayload(
      getCatalogGroupedByRegion,
      likelyRegions.length ? likelyRegions : null
    );

    const catalogForPrompt =
      catalogPayload.total > 0
        ? catalogPayload.byRegion
        : getCatalogGroupedByRegion();

    // Compact catalog strings for speed
    const compactCatalog = {};
    Object.entries(catalogForPrompt).forEach(([region, list]) => {
      compactCatalog[region] = (list || []).map((e) => ({
        id: e.id,
        title: e.title,
        cue: e.cue,
      }));
    });

    const prior = history
      .slice(-8)
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'K'}: ${String(m.content).slice(0, 180)}`)
      .join('\n');

    const userTurns = history.filter((m) => m.role === 'user').length + 1;
    // 1 complaint + 1 answer → options (stop repeat clarifies)
    const forceOptions = userTurns >= 2 || Boolean(facts.side);

    const forbid = [];
    if (facts.side) forbid.push('sol/sağ/her iki taraf SORMA');
    if (facts.height) forbid.push('üst/orta/alt SORMA');
    if (facts.depth) forbid.push('ön/arka/iç/dış SORMA');

    const user = [
      prior ? `Konuşma:\n${prior}\n` : '',
      `Mesaj: "${q}"`,
      norm.normalized && norm.normalized !== fold(q)
        ? `Normalize: "${norm.normalized}"`
        : '',
      facts.notes.length ? `Bilinen: ${facts.notes.join('; ')}` : '',
      forbid.length ? `YASAK: ${forbid.join(' | ')}` : '',
      likelyRegions.length
        ? `Bölge filtresi: ${likelyRegions.join(', ')}`
        : 'Bölge filtresi: tümü',
      forceOptions
        ? 'ZORUNLU: phase="options" — soru sorma, 2–3 seçenek ver.'
        : 'Gerekirse tek kısa clarify; tekrar soru yok. Netse options.',
      `Katalog: ${JSON.stringify(compactCatalog)}`,
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this._chatJson({
      system: SOHBET_SYSTEM_PROMPT,
      user,
      schema: CHAT_SCHEMA,
      numPredict: forceOptions ? 280 : 200,
      temperature: 0.1,
    });

    if (!parsed.ok) return parsed;

    const data = parsed.data;
    let phase = String(data.phase || '').toLowerCase() === 'options' ? 'options' : 'clarify';
    if (forceOptions) phase = 'options';

    // Guard: if model tried to re-ask side while we know it, flip to options
    const msgLower = fold(String(data.message || ''));
    if (
      phase === 'clarify' &&
      facts.side &&
      /(sol|sag|her iki|iki taraf)/.test(msgLower)
    ) {
      phase = 'options';
    }

    let message = String(data.message || data.summary || '').trim().slice(0, 280);

    // Dedupe choices
    const choiceSeen = new Set();
    const choices = [];
    for (const c of data.choices || []) {
      const label = String(c || '').trim();
      if (!label) continue;
      const key = fold(label);
      if (choiceSeen.has(key)) continue;
      choiceSeen.add(key);
      choices.push(label);
      if (choices.length >= 3) break;
    }

    const options = [];
    const seen = new Set();
    for (const raw of data.options || []) {
      const id = raw?.id;
      if (!id || !this.validIds.has(id) || seen.has(id)) continue;
      seen.add(id);
      const p = this.pathologies.find((x) => x.id === id);
      options.push({
        id,
        label: String(raw.label || p?.title || id).slice(0, 80),
        why: String(raw.why || '').slice(0, 120),
        severity: p?.severity || '',
        region: p?.region || '',
      });
      if (options.length >= 3) break;
    }

    let region = data.region;
    if (!this.validRegions.has(region)) {
      region = options[0]?.region || likelyRegions[0] || null;
    }

    if (phase === 'options' && options.length < 2) {
      // Last-resort: pick top catalog entries from scoped regions
      const pool = likelyRegions.length
        ? this.pathologies.filter((p) => likelyRegions.includes(p.region))
        : this.pathologies;
      for (const p of pool) {
        if (seen.has(p.id)) continue;
        options.push({
          id: p.id,
          label: p.title.split('(')[0].trim(),
          why: 'Şikayet bölgesine göre olası eşleşme',
          severity: p.severity,
          region: p.region,
        });
        seen.add(p.id);
        if (options.length >= 2) break;
      }
      if (options.length >= 2) {
        phase = 'options';
        if (!message) {
          message = 'Anlattığına göre şu seçenekler öne çıkıyor.';
        }
      } else if (!forceOptions && message) {
        phase = 'clarify';
      }
    }

    if (!message && phase === 'clarify') {
      return {
        ok: true,
        phase: 'clarify',
        message: facts.side
          ? 'Ağrı daha çok üstte mi, altta mı?'
          : 'Ağrı sol tarafta mı, sağda mı, yoksa her iki tarafta mı?',
        choices: facts.side
          ? ['Üst', 'Orta', 'Alt']
          : ['Sol taraf', 'Sağ taraf', 'Her iki taraf'],
        options: [],
        region: likelyRegions[0] || null,
        confidence: 0.35,
        catalogScope: likelyRegions,
      };
    }

    if (phase === 'options' && !options.length) {
      return { ok: false, reason: 'no_match', message };
    }

    return {
      ok: true,
      model: this.model,
      phase,
      message:
        message ||
        (phase === 'options'
          ? 'Anlattığına göre birkaç olası nokta öne çıkıyor.'
          : 'Yeri biraz daha netleştirelim.'),
      choices: phase === 'clarify' ? choices : [],
      options: phase === 'options' ? options : [],
      region: region || null,
      confidence: clamp01(data.confidence),
      catalogScope: likelyRegions,
      catalogSize: catalogPayload.total || getPathologyCatalogForAI().length,
    };
  }

  /** Fiziko Sağlık: free-form advice with editable system prompt + history. */
  async healthChat(userMessage, { systemPrompt, history = [] } = {}) {
    const q = (userMessage || '').trim();
    if (q.length < 2) return { ok: false, reason: 'empty' };

    if (this._available === null) await this.checkAvailable();
    if (!this._available) return { ok: false, reason: 'offline' };

    const messages = [
      {
        role: 'system',
        content: systemPrompt || 'Sen yardımcı bir sağlık asistanısın. Türkçe yanıt ver.',
      },
      ...history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 800),
      })),
      { role: 'user', content: q },
    ];

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          stream: false,
          think: false,
          options: { temperature: 0.45, num_predict: 380 },
          messages,
        }),
      });

      clearTimeout(timer);

      if (!res.ok) {
        return { ok: false, reason: `http_${res.status}` };
      }

      const data = await res.json();
      let text = String(data?.message?.content || '').trim();
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      if (!text) return { ok: false, reason: 'empty_reply' };

      return { ok: true, model: this.model, text: text.slice(0, 1200) };
    } catch (err) {
      const reason = err?.name === 'AbortError' ? 'timeout' : 'error';
      return { ok: false, reason, detail: String(err?.message || err) };
    }
  }

  async _chatJson({ system, user, schema, numPredict = 300, temperature = 0.1 }) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          stream: false,
          think: false,
          format: schema,
          options: { temperature, num_predict: numPredict },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return { ok: false, reason: `http_${res.status}`, detail: errText };
      }

      const data = await res.json();
      const raw = data?.message?.content || '';
      const parsed = parseModelJson(raw);
      if (!parsed) {
        return { ok: false, reason: 'bad_json', detail: raw };
      }
      return { ok: true, data: parsed };
    } catch (err) {
      const reason = err?.name === 'AbortError' ? 'timeout' : 'error';
      return { ok: false, reason, detail: String(err?.message || err) };
    }
  }
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0.5;
  return Math.max(0, Math.min(1, x));
}

function parseModelJson(raw) {
  if (!raw) return null;
  let text = String(raw).trim();
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
