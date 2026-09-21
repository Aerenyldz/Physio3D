import gsap from 'gsap';

/**
 * Header'daki serbest metin arama — şikayet / bölge yazar, modele yansıtır.
 */
export class SymptomSearch {
  constructor() {
    this.form = document.getElementById('symptom-search-form');
    this.input = document.getElementById('symptom-input');
    this.clearBtn = document.getElementById('symptom-clear-btn');
    this.hint = document.getElementById('symptom-search-hint');
    this.onSearch = null;
    this.onClear = null;

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    if (this.input) {
      // Debounced live search while typing
      let timer = null;
      this.input.addEventListener('input', () => {
        const hasText = this.input.value.trim().length > 0;
        if (this.clearBtn) this.clearBtn.hidden = !hasText;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (this.input.value.trim().length >= 2) this.submit(false);
        }, 380);
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clear());
    }
  }

  submit(fromSubmit = true) {
    const query = (this.input?.value || '').trim();
    if (!query) {
      this.clear();
      return;
    }
    if (this.onSearch) this.onSearch(query, { fromSubmit });
  }

  clear() {
    if (this.input) this.input.value = '';
    if (this.clearBtn) this.clearBtn.hidden = true;
    if (this.onClear) this.onClear();
  }

  setHint(text, tone = 'neutral') {
    if (!this.hint) return;
    this.hint.textContent = text;
    this.hint.dataset.tone = tone;
    gsap.fromTo(this.hint, { opacity: 0.4 }, { opacity: 1, duration: 0.25 });
  }

  onSearched(cb) {
    this.onSearch = cb;
  }

  onCleared(cb) {
    this.onClear = cb;
  }
}
