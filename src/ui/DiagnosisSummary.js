import gsap from 'gsap';

export class DiagnosisSummary {
    constructor() {
        const uiLayer = document.getElementById('ui-layer') || document.body;
        this.panel = document.createElement('div');
        this.panel.id = 'diagnosis-panel';
        this.panel.innerHTML = `
            <div class="diagnosis-header">
                <h3 class="diagnosis-title">Tanı Özet Paneli</h3>
                <span class="diagnosis-count" id="diagnosis-count">0</span>
            </div>
            <p class="diagnosis-subtitle">Tespit Edilen Kritik Bulgular</p>
            <ul class="diagnosis-list" id="diagnosis-list"></ul>
        `;
        uiLayer.appendChild(this.panel);

        this.listElement = this.panel.querySelector('#diagnosis-list');
        this.countElement = this.panel.querySelector('#diagnosis-count');
        this.selectedPathologies = [];
        this.onItemClick = null;
    }

    addPathology(pathology) {
        if (this.selectedPathologies.find(p => p.id === pathology.id)) return;
        
        this.selectedPathologies.push(pathology);
        
        const li = document.createElement('li');
        li.className = 'diagnosis-item';
        
        let color = '#22c55e';
        if (pathology.severity === 'Orta') color = '#f59e0b';
        else if (pathology.severity === 'Yüksek') color = '#ef4444';
        else if (pathology.severity === 'Kritik') color = '#dc2626';

        li.innerHTML = `
            <span class="diagnosis-dot" style="background-color: ${color}"></span>
            <span class="diagnosis-item-text">${pathology.title}</span>
            <span class="diagnosis-item-severity">${pathology.severity} Seviye</span>
        `;
        
        li.addEventListener('click', () => {
            if (this.onItemClick) this.onItemClick(pathology);
        });
        
        this.listElement.appendChild(li);
        gsap.fromTo(li, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
        
        this.updateCount();
    }

    removePathology(id) {
        this.selectedPathologies = this.selectedPathologies.filter(p => p.id !== id);
        this.listElement.innerHTML = '';
        const temp = [...this.selectedPathologies];
        this.selectedPathologies = [];
        temp.forEach(p => this.addPathology(p));
        this.updateCount();
    }

    clear() {
        this.selectedPathologies = [];
        this.listElement.innerHTML = '';
        this.updateCount();
    }

    /** Replace list with search matches (does not auto-open info panel) */
    setFromSearch(pathologies, query) {
        this.clear();
        const subtitle = this.panel.querySelector('.diagnosis-subtitle');
        if (subtitle) {
            subtitle.textContent = query
                ? `"${query}" — eşleşen patolojiler`
                : 'Tespit Edilen Kritik Bulgular';
        }
        pathologies.forEach((p) => this.addPathology(p));
    }

    resetSubtitle() {
        const subtitle = this.panel.querySelector('.diagnosis-subtitle');
        if (subtitle) subtitle.textContent = 'Tespit Edilen Kritik Bulgular';
    }

    updateCount() {
        if (this.countElement) {
            this.countElement.textContent = this.selectedPathologies.length;
        }
    }

    onItemClicked(callback) {
        this.onItemClick = callback;
    }

    getSelectedIds() {
        return this.selectedPathologies.map(p => p.id);
    }
}
