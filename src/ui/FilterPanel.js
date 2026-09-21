import { getAllRegions } from '../data/pathologies.js';

export class FilterPanel {
    constructor() {
        this.regionFilters = document.getElementById('region-filters');
        this.severityFilters = document.getElementById('severity-filters');
        this.categoryFilters = document.getElementById('category-filters');
        this.visibleCount = document.getElementById('visible-count');
        this.totalCount = document.getElementById('total-count');
        
        this.activeFilter = { region: 'all', severity: 'all', category: 'all' };
        this.onFilterChange = null;
        
        this.populateRegions();
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e.currentTarget));
        });
    }

    populateRegions() {
        if (!this.regionFilters) return;
        const regions = getAllRegions();
        regions.forEach(region => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = region;
            btn.dataset.type = 'region';
            btn.textContent = region;
            btn.addEventListener('click', (e) => this.handleFilterClick(e.currentTarget));
            this.regionFilters.appendChild(btn);
        });
    }

    handleFilterClick(button) {
        const type = button.dataset.type;
        const filter = button.dataset.filter;
        if (!type || !filter) return;

        const parent = button.closest('.filter-buttons');
        if (parent) {
            parent.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        }
        button.classList.add('active');

        this.activeFilter[type] = filter;

        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilter);
        }
    }

    getActiveFilter() {
        return { ...this.activeFilter };
    }

    updateVisibleCount(count) {
        if (this.visibleCount) {
            this.visibleCount.textContent = count;
        }
    }

    setTotalCount(count) {
        if (this.totalCount) {
            this.totalCount.textContent = count;
        }
    }

    onFilterChanged(callback) {
        this.onFilterChange = callback;
    }

    /** Sync region button UI when search detects a body region */
    setRegion(region) {
        if (!this.regionFilters) return;
        this.activeFilter.region = region || 'all';
        this.regionFilters.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === this.activeFilter.region);
        });
    }

    resetFilters() {
        this.activeFilter = { region: 'all', severity: 'all', category: 'all' };
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilter);
        }
    }
}
