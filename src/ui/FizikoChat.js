import gsap from 'gsap';

/**
 * Physio AI — single user chat: clarify location → options → 3D focus.
 * Prompt lives in code / future admin panel — not editable here.
 */
export class FizikoChat {
  constructor() {
    this.onSohbetAsk = null;
    this.onOptionSelect = null;
    this.busy = false;
    this.sohbetHistory = [];

    this._build();
    this._bind();
    this._showWelcome();
  }

  _build() {
    const host = document.getElementById('ui-layer') || document.body;
    this.root = document.createElement('aside');
    this.root.id = 'fiziko-chat';
    this.root.innerHTML = `
      <div class="fiziko-head">
        <div class="fiziko-brand">
          <span class="fiziko-mark" aria-hidden="true"></span>
          <div>
            <strong class="fiziko-title">Physio AI</strong>
            <p class="fiziko-sub">Yerel sohbet · Ollama</p>
          </div>
        </div>
      </div>

      <div class="fiziko-body" id="fiziko-messages" role="log" aria-live="polite"></div>

      <form class="fiziko-composer" id="fiziko-form" autocomplete="off">
        <input
          id="fiziko-input"
          type="text"
          maxlength="400"
          placeholder="Şikayetini yaz… örn. omzum ağrıyor"
        />
        <button type="submit" id="fiziko-send">Gönder</button>
      </form>
      <p class="fiziko-status" id="fiziko-status">Hazır</p>
    `;
    host.appendChild(this.root);

    this.messagesEl = this.root.querySelector('#fiziko-messages');
    this.form = this.root.querySelector('#fiziko-form');
    this.input = this.root.querySelector('#fiziko-input');
    this.statusEl = this.root.querySelector('#fiziko-status');
  }

  _bind() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._submit();
    });
  }

  _showWelcome() {
    this._appendBubble(
      'assistant',
      'Merhaba, ben Physio AI. Şikayetini anlat; önce yerini netleştirmek için kısa sorular soracağım. Sonra 2–3 olası nokta önereceğim — birini seçince modelde o bölge açılır.'
    );
  }

  async _submit(presetText) {
    const text = (presetText || this.input.value || '').trim();
    if (!text || this.busy) return;

    if (!presetText) this.input.value = '';
    this.addUser(text);
    this.setBusy(true);

    try {
      if (this.onSohbetAsk) {
        await this.onSohbetAsk(text, {
          history: this.sohbetHistory.slice(0, -1),
        });
      }
    } finally {
      this.setBusy(false);
    }
  }

  setBusy(busy) {
    this.busy = busy;
    this.input.disabled = busy;
    this.root.querySelector('#fiziko-send').disabled = busy;
    this.root.querySelectorAll('.fiziko-choice').forEach((b) => {
      b.disabled = busy;
    });
    this.setStatus(busy ? 'Physio AI düşünüyor…' : 'Hazır', busy ? 'neutral' : 'ok');
  }

  setStatus(text, tone = 'neutral') {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.dataset.tone = tone;
  }

  setOnline(ok, modelName = '') {
    this.setStatus(
      ok ? `Çevrimiçi · ${modelName || 'Ollama'}` : 'Ollama kapalı — sohbet çalışmaz',
      ok ? 'ok' : 'warn'
    );
  }

  addUser(text) {
    this._appendBubble('user', text);
    this.sohbetHistory.push({ role: 'user', content: text });
    if (this.sohbetHistory.length > 14) {
      this.sohbetHistory = this.sohbetHistory.slice(-14);
    }
  }

  addAssistant(text) {
    this._appendBubble('assistant', text);
    this.sohbetHistory.push({ role: 'assistant', content: text });
    if (this.sohbetHistory.length > 14) {
      this.sohbetHistory = this.sohbetHistory.slice(-14);
    }
  }

  /** Clarify turn: question + quick-reply chips. */
  addClarify(message, choices = []) {
    const wrap = document.createElement('div');
    wrap.className = 'fiziko-msg assistant';

    const p = document.createElement('p');
    p.className = 'fiziko-bubble';
    p.textContent = message;
    wrap.appendChild(p);

    this.sohbetHistory.push({ role: 'assistant', content: message });

    if (choices.length) {
      const row = document.createElement('div');
      row.className = 'fiziko-choices';
      const seen = new Set();
      choices.forEach((choice) => {
        const label = String(choice || '').trim();
        if (!label) return;
        const key = label.toLocaleLowerCase('tr-TR');
        if (seen.has(key)) return;
        seen.add(key);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fiziko-choice';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (this.busy) return;
          row.querySelectorAll('.fiziko-choice').forEach((b) => {
            b.disabled = true;
          });
          btn.classList.add('selected');
          this._submit(label);
        });
        row.appendChild(btn);
      });
      wrap.appendChild(row);
    }

    this.messagesEl.appendChild(wrap);
    this._scrollBottom();
    gsap.fromTo(wrap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28 });
  }

  /** Options turn: summary + pathology buttons → 3D. */
  addSohbetResult(summary, options = []) {
    const wrap = document.createElement('div');
    wrap.className = 'fiziko-msg assistant';

    const p = document.createElement('p');
    p.className = 'fiziko-bubble';
    p.textContent = summary;
    wrap.appendChild(p);

    this.sohbetHistory.push({ role: 'assistant', content: summary });

    if (options.length) {
      const hint = document.createElement('p');
      hint.className = 'fiziko-options-label';
      hint.textContent = 'Bu seçenekler olabilir — birini seç:';
      wrap.appendChild(hint);

      const list = document.createElement('div');
      list.className = 'fiziko-options';

      options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fiziko-option';
        btn.innerHTML = `
          <span class="fiziko-option-title">${escapeHtml(opt.label)}</span>
          ${opt.why ? `<span class="fiziko-option-why">${escapeHtml(opt.why)}</span>` : ''}
          ${opt.severity ? `<span class="fiziko-option-sev">${escapeHtml(opt.severity)}</span>` : ''}
        `;
        btn.addEventListener('click', () => {
          list.querySelectorAll('.fiziko-option').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          if (this.onOptionSelect) this.onOptionSelect(opt.id);
        });
        list.appendChild(btn);
      });

      wrap.appendChild(list);
    }

    this.messagesEl.appendChild(wrap);
    this._scrollBottom();
    gsap.fromTo(wrap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28 });
  }

  _appendBubble(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `fiziko-msg ${role}`;
    const bubble = document.createElement('p');
    bubble.className = 'fiziko-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    this.messagesEl.appendChild(wrap);
    this._scrollBottom();
    gsap.fromTo(wrap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25 });
  }

  _scrollBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  onSohbetAsked(cb) {
    this.onSohbetAsk = cb;
  }

  onOptionSelected(cb) {
    this.onOptionSelect = cb;
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
