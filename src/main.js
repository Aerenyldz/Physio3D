import './styles/main.css';

import * as THREE from 'three';
import gsap from 'gsap';

import { SceneManager } from './scene/SceneManager.js';
import { PathologyManager } from './pathology/PathologyManager.js';
import { bindPathologiesToAnatomy } from './pathology/AnatomyAnchors.js';
import { MuscleHighlight } from './pathology/MuscleHighlight.js';
import { InfoPanel } from './ui/InfoPanel.js';
import { DiagnosisSummary } from './ui/DiagnosisSummary.js';
import { FilterPanel } from './ui/FilterPanel.js';
import { LabelSystem } from './ui/LabelSystem.js';
import { SymptomSearch } from './ui/SymptomSearch.js';
import { FizikoChat } from './ui/FizikoChat.js';
import { PainAnalyzer } from './ai/PainAnalyzer.js';

class Physio3DApp {
    constructor() {
        this.sceneManager = null;
        this.pathologyManager = null;
        this.infoPanel = null;
        this.diagnosisSummary = null;
        this.filterPanel = null;
        this.labelSystem = null;
        this.symptomSearch = null;
        this.muscleHighlight = new MuscleHighlight();
        this.painAnalyzer = null;
        this.selectedPathologyId = null;
        this._searchToken = 0;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.fpsCounter = document.getElementById('fps-counter');
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();

        setTimeout(() => this.dismissLoader(), 8000);

        this.init();
    }

    async init() {
        try {
            this.sceneManager = new SceneManager();
            await this.sceneManager.loadModel();

            this.pathologyManager = new PathologyManager(
                this.sceneManager.getScene(),
                this.sceneManager.getCamera()
            );
            this.pathologyManager.initialize();

            // Hotspot'ları gerçek anatomi mesh merkezlerine bağla
            bindPathologiesToAnatomy(
                this.sceneManager.getModelGroup(),
                this.pathologyManager.getAllPathologies()
            );
            this.pathologyManager.hotspotSystem.repositionFromPathologies();

            this.initUI();
            this.bindInteractions();
            this.startUpdateLoop();

            console.log('✅ Physio3D Pro başarıyla yüklendi.');
        } catch (error) {
            console.error('❌ Physio3D Pro yüklenirken hata:', error);
        } finally {
            this.dismissLoader();
        }
    }

    initUI() {
        const camera = this.sceneManager.getCamera();
        const scene = this.sceneManager.getScene();
        const modelGroup = this.sceneManager.getModelGroup();

        this.infoPanel = new InfoPanel();
        this.infoPanel.onReset(() => {
            this.selectedPathologyId = null;
            this.muscleHighlight.clear();
            this.sceneManager.getCameraController().resetToDefault();
        });

        this.diagnosisSummary = new DiagnosisSummary();
        this.diagnosisSummary.onItemClicked((pathology) => {
            this.selectPathology(pathology.id);
        });

        this.filterPanel = new FilterPanel();
        this.filterPanel.setTotalCount(this.pathologyManager.getAllPathologies().length);
        this.filterPanel.updateVisibleCount(this.pathologyManager.getAllPathologies().length);
        this.filterPanel.onFilterChanged((activeFilter) => {
            const visibleCount = this.pathologyManager.applyFilters(activeFilter);
            this.filterPanel.updateVisibleCount(visibleCount);

            const markers = this.pathologyManager.getMarkers();
            markers.forEach((marker) => {
                this.labelSystem.setVisibility(marker.id, marker.group.visible);
            });
        });

        this.labelSystem = new LabelSystem(scene, camera, modelGroup);
        const allPathologies = this.pathologyManager.getAllPathologies();
        allPathologies.forEach((p) => this.labelSystem.createLabel(p));
        this.labelSystem.repositionFromPathologies();
        this.labelSystem.onLabelClicked((id) => {
            this.selectPathology(id);
        });
        this.labelSystem.onLabelHovered((id) => {
            this.handleMuscleHover(id);
        });

        this.symptomSearch = new SymptomSearch();
        this.symptomSearch.onSearched((query, opts) => this.handleSymptomSearch(query, opts));
        this.symptomSearch.onCleared(() => this.handleSymptomClear());

        this.painAnalyzer = new PainAnalyzer(this.pathologyManager.getAllPathologies());
        this.fizikoChat = new FizikoChat();
        this.fizikoChat.onSohbetAsked((text, ctx) => this.handleFizikoSohbet(text, ctx));
        this.fizikoChat.onOptionSelected((id) => this.selectPathology(id));

        this.painAnalyzer.checkAvailable().then((ok) => {
            this.fizikoChat.setOnline(ok, this.painAnalyzer.model);
        });
    }

    /** Top bar: fast region / keyword search only (no AI). */
    async handleSymptomSearch(query, { fromSubmit = true } = {}) {
        void fromSubmit;
        const result = this.pathologyManager.applySearch(query);
        this._applySearchResult(result, query, { source: 'rules' });
    }

    async handleFizikoSohbet(text, ctx = {}) {
        const ai = await this.painAnalyzer.chatAnalyze(text, ctx);

        if (!ai?.ok) {
            const msg =
                ai?.reason === 'offline'
                    ? 'Ollama kapalı görünüyor. `ollama serve` çalıştırıp tekrar dene.'
                    : ai?.message ||
                      'Net bir eşleşme çıkmadı. Bölgeyi veya ağrıyı biraz daha anlatır mısın?';
            this.fizikoChat.addAssistant(msg);
            this.fizikoChat.setStatus(
                ai?.reason === 'offline' ? 'Ollama offline' : 'Eşleşme yok',
                'warn'
            );
            return;
        }

        if (ai.phase === 'clarify') {
            this.fizikoChat.addClarify(ai.message, ai.choices || []);
            this.fizikoChat.setStatus('Konum netleştiriliyor…', 'ok');
            return;
        }

        this.fizikoChat.addSohbetResult(ai.message, ai.options);
        this.fizikoChat.setStatus(
            `Seçenekler hazır · %${Math.round((ai.confidence || 0.5) * 100)} güven`,
            'ok'
        );

        if (ai.region) {
            this.filterPanel.setRegion(ai.region);
        }

        if (ai.options?.length) {
            const ids = ai.options.map((o) => o.id);
            const result = this.pathologyManager.applyAiMatch(ids, {
                region: ai.region,
                rationale: ai.message,
            });
            this.filterPanel.updateVisibleCount(result.visibleCount);
            const markers = this.pathologyManager.getMarkers();
            markers.forEach((marker) => {
                this.labelSystem.setVisibility(marker.id, marker.group.visible);
            });
            this.diagnosisSummary.setFromSearch(result.ranked.slice(0, 8), text);
        }
    }

    _applySearchResult(result, query, meta = {}) {
        this.filterPanel.updateVisibleCount(result.visibleCount);

        if (result.detectedRegion) {
            this.filterPanel.setRegion(result.detectedRegion);
        }

        const markers = this.pathologyManager.getMarkers();
        markers.forEach((marker) => {
            this.labelSystem.setVisibility(marker.id, marker.group.visible);
        });

        if (result.visibleCount === 0) {
            this.diagnosisSummary.setFromSearch([], query);
            return;
        }

        this.diagnosisSummary.setFromSearch(result.ranked.slice(0, 8), query);

        if (result.bestMatch) {
            this.selectPathology(result.bestMatch.id);
        }
    }

    handleSymptomClear() {
        this.filterPanel.resetFilters();
        this.filterPanel.updateVisibleCount(this.pathologyManager.getAllPathologies().length);
        this.diagnosisSummary.clear();
        this.diagnosisSummary.resetSubtitle();

        const markers = this.pathologyManager.getMarkers();
        markers.forEach((marker) => {
            this.labelSystem.setVisibility(marker.id, true);
        });

        this.sceneManager.getCameraController().resetToDefault();
        if (this.infoPanel?.hide) this.infoPanel.hide();
    }

    bindInteractions() {
        const renderer = this.sceneManager.getRenderer();
        const camera = this.sceneManager.getCamera();

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, camera);
            const interactables = this.pathologyManager.hotspotSystem.getInteractableObjects();
            const intersects = this.raycaster.intersectObjects(interactables);
            document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
        });

        renderer.domElement.addEventListener('click', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, camera);
            const interactables = this.pathologyManager.hotspotSystem.getInteractableObjects();
            const intersects = this.raycaster.intersectObjects(interactables);
            if (intersects.length > 0) {
                const id = intersects[0].object.userData.id;
                if (id) this.selectPathology(id);
            }
        });
    }

    handleMuscleHover(id) {
        // Leaving a label: keep glow if that pathology is selected
        if (!id) {
            if (this.selectedPathologyId) {
                this._applyMuscleGlow(this.selectedPathologyId);
            } else {
                this.muscleHighlight.clear();
            }
            return;
        }
        this._applyMuscleGlow(id);
    }

    _applyMuscleGlow(id) {
        const pathology = this.pathologyManager.getPathology(id);
        const meshes = pathology?.anchorMeshes;
        if (!meshes?.length) {
            this.muscleHighlight.clear();
            return;
        }

        let color = 0xfbbf24;
        if (pathology.severity === 'Yüksek') color = 0xf87171;
        else if (pathology.severity === 'Kritik') color = 0xef4444;
        else if (pathology.severity === 'Düşük') color = 0x4ade80;

        this.muscleHighlight.highlight(id, meshes, {
            color,
            intensity: 0.7,
            xray: true,
            modelGroup: this.sceneManager.getModelGroup(),
        });
    }

    selectPathology(id) {
        const pathology = this.pathologyManager.getPathology(id);
        if (!pathology) return;

        this.selectedPathologyId = id;

        const focus = pathology.focusPoint || pathology.hotspotCoordinates;
        this.sceneManager.getCameraController().animateToFocus(focus, { distance: 10 });

        this.infoPanel.show(pathology);
        this.diagnosisSummary.addPathology(pathology);
        if (this.labelSystem) this.labelSystem.setActive(id);
        this._applyMuscleGlow(id);
    }

    startUpdateLoop() {
        const clock = this.sceneManager.getClock();
        const camera = this.sceneManager.getCamera();

        const animate = () => {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            this.sceneManager.updateParticles(delta);
            this.sceneManager.getCameraController().update();
            this.pathologyManager.hotspotSystem.animateMarkers(elapsed, camera);

            const markers = this.pathologyManager.getMarkers();
            this.labelSystem.updatePositions(markers);

            if (!this._occludersReady && this.sceneManager.getModelGroup().children.length) {
                this.labelSystem.invalidateOccluders();
                this._occludersReady = true;
            }

            this.sceneManager.render();
            this.updateFPS();
        };

        animate();
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            if (this.fpsCounter) {
                this.fpsCounter.textContent = this.frameCount + ' FPS';
            }
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    dismissLoader() {
        const loaderEl = document.getElementById('loader');
        if (!loaderEl || loaderEl.style.display === 'none') return;

        gsap.to(loaderEl, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loaderEl.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.physio3d = new Physio3DApp();
});
