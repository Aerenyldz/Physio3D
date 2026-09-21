import { PATHOLOGIES_DATABASE } from '../data/pathologies.js';
import { HotspotSystem } from './HotspotSystem.js';
import { FilterEngine } from './FilterEngine.js';

export class PathologyManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.pathologies = PATHOLOGIES_DATABASE.map(p => {
            let earlyWarning = '';
            if (p.severity === 'Kritik') {
                earlyWarning = '🚨 Acil Uzman Hekim/Ortopedi Muayenesi ve Radyolojik İnceleme (MRI/BT) Gereklidir.';
            } else if (p.severity === 'Yüksek') {
                earlyWarning = '🚨 Fizyoterapist Değerlendirmesi Önerilir. Erken Teşhis İlerlemenin Önüne Geçer.';
            } else {
                earlyWarning = '⚠️ Klinik Değerlendirme ve Postüral Düzenleme Önerilir.';
            }
            const exerciseRecommendation = p.rehabFocus && p.rehabFocus.length > 0 
                ? '🏋️ ' + p.rehabFocus.join(', ') 
                : 'Genel egzersiz önerilir.';
            
            return {
                ...p,
                earlyWarning,
                exerciseRecommendation
            };
        });
        this.hotspotSystem = new HotspotSystem(scene);
        this.filterEngine = new FilterEngine(this.pathologies);
        this.onPathologySelect = null;
    }

    initialize() {
        this.pathologies.forEach(pathology => {
            this.hotspotSystem.createMarker(pathology);
        });
        return this;
    }

    selectPathology(id) {
        const pathology = this.getPathology(id);
        if (pathology && this.onPathologySelect) {
            this.onPathologySelect(pathology);
        }
    }

    applyFilters(activeFilter) {
        const result = this.filterEngine.filter(activeFilter);
        
        this.pathologies.forEach(p => {
            const isVisible = result.visibleIds.has(p.id);
            this.hotspotSystem.setMarkerVisibility(p.id, isVisible);
        });
        
        return result.visibleCount;
    }

    applySearch(query) {
        const result = this.filterEngine.search(query);

        this.pathologies.forEach((p) => {
            const isVisible = result.visibleIds.has(p.id);
            this.hotspotSystem.setMarkerVisibility(p.id, isVisible);
        });

        return result;
    }

    /**
     * Show only the given pathology IDs (from local AI) and build a search-like result.
     */
    applyAiMatch(pathologyIds, { region = null, rationale = '' } = {}) {
        const ordered = [];
        const idSet = new Set();

        (pathologyIds || []).forEach((id) => {
            const p = this.pathologies.find((x) => x.id === id);
            if (p && !idSet.has(id)) {
                idSet.add(id);
                ordered.push(p);
            }
        });

        this.pathologies.forEach((p) => {
            this.hotspotSystem.setMarkerVisibility(p.id, idSet.has(p.id));
        });

        return {
            visibleIds: idSet,
            visibleCount: idSet.size,
            ranked: ordered,
            bestMatch: ordered[0] || null,
            detectedRegion: region || ordered[0]?.region || null,
            suggestion: null,
            source: 'ai',
            rationale,
        };
    }

    showAll() {
        this.pathologies.forEach((p) => {
            this.hotspotSystem.setMarkerVisibility(p.id, true);
        });
        return this.pathologies.length;
    }

    getPathology(id) {
        return this.pathologies.find(p => p.id === id);
    }

    getAllPathologies() {
        return this.pathologies;
    }

    getMarkers() {
        return this.hotspotSystem.getMarkers();
    }

    onPathologySelected(callback) {
        this.onPathologySelect = callback;
    }
}
