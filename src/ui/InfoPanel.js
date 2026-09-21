import gsap from 'gsap';

export class InfoPanel {
    constructor() {
        this.panel = document.getElementById('info-panel');
        this.btnPanelClose = document.getElementById('panel-close');
        this.panelSeverity = document.getElementById('panel-severity');
        this.panelSeverityText = document.getElementById('panel-severity-text');
        this.panelRegion = document.getElementById('panel-region');
        this.panelTitle = document.getElementById('panel-title');
        this.panelLatin = document.getElementById('panel-latin');
        this.panelDesc = document.getElementById('panel-desc');
        this.panelEarlyWarning = document.getElementById('panel-early-warning');
        this.panelExercise = document.getElementById('panel-exercise');
        this.panelCategory = document.getElementById('panel-category');
        this.btnReset = document.getElementById('btn-reset');
        
        this.isVisible = false;
        this.onResetCallback = null;

        if (this.btnPanelClose) {
            this.btnPanelClose.addEventListener('click', () => this.hide());
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => this.hide());
        }
    }

    show(pathology) {
        let earlyWarning = '';
        if (pathology.severity === 'Kritik') {
            earlyWarning = '🚨 Acil Uzman Hekim/Ortopedi Muayenesi ve Radyolojik İnceleme (MRI/BT) Gereklidir.';
        } else if (pathology.severity === 'Yüksek') {
            earlyWarning = '🚨 Fizyoterapist Değerlendirmesi Önerilir. Erken Teşhis İlerlemenin Önüne Geçer.';
        } else {
            earlyWarning = '⚠️ Klinik Değerlendirme ve Postüral Düzenleme Önerilir.';
        }

        const exerciseRecommendation = pathology.rehabFocus && pathology.rehabFocus.length > 0 
            ? '🏋️ ' + pathology.rehabFocus.join(', ') 
            : 'Genel egzersiz önerilir.';

        if (this.panelRegion) this.panelRegion.textContent = pathology.region || '';
        if (this.panelTitle) this.panelTitle.textContent = pathology.title || '';
        if (this.panelLatin) this.panelLatin.textContent = pathology.latinName || '';
        if (this.panelDesc) this.panelDesc.textContent = pathology.description || '';
        if (this.panelEarlyWarning) this.panelEarlyWarning.textContent = earlyWarning;
        if (this.panelExercise) this.panelExercise.textContent = exerciseRecommendation;

        if (this.panelSeverity) {
            const normalizedKey = (pathology.severity || '').toLowerCase()
                .replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i');
            this.panelSeverity.className = 'panel-severity-badge sev-badge-' + normalizedKey;
        }
        if (this.panelSeverityText) this.panelSeverityText.textContent = pathology.severity || '';
        if (this.panelCategory) this.panelCategory.textContent = pathology.category || '';

        this.fillList('panel-symptoms', pathology.symptoms || []);
        this.fillList('panel-structures', pathology.affectedStructures || []);
        this.fillList('panel-movements', pathology.aggravatingMovements || []);
        this.fillList('panel-rehab', pathology.rehabFocus || []);

        if (this.panel) {
            this.panel.style.visibility = 'visible';
            gsap.to(this.panel, { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' });
        }
        this.isVisible = true;
    }

    hide() {
        if (this.panel) {
            gsap.to(this.panel, { 
                opacity: 0, 
                x: 30, 
                scale: 0.95, 
                duration: 0.3, 
                onComplete: () => {
                    this.panel.style.visibility = 'hidden';
                }
            });
        }
        this.isVisible = false;
        if (this.onResetCallback) {
            this.onResetCallback();
        }
    }

    fillList(elementId, items) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            el.appendChild(li);
        });
    }

    onReset(callback) {
        this.onResetCallback = callback;
    }

    isOpen() {
        return this.isVisible;
    }
}
