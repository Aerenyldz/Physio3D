import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class LabelSystem {
    constructor(scene, camera, modelGroup) {
        this.scene = scene;
        this.camera = camera;
        this.modelGroup = modelGroup;
        this.labels = new Map();
        this.raycaster = new THREE.Raycaster();
        this.onLabelClick = null;
        this.onLabelHover = null; // (id | null) => void
        this._frame = 0;
        this._occluders = null;
        this._occlusionCache = new Map(); // id -> boolean
        this._hoveredId = null;
    }

    /** Prefer large body parts only — full 800-mesh raycast kills FPS. */
    getOccluders() {
        if (this._occluders) return this._occluders;
        const list = [];
        if (this.modelGroup) {
            this.modelGroup.traverse((child) => {
                if (!child.isMesh || !child.visible) return;
                if (!child.geometry.boundingSphere) {
                    child.geometry.computeBoundingSphere();
                }
                const r = child.geometry.boundingSphere?.radius || 0;
                // Keep medium/large anatomical parts as occluders
                if (r > 0.08) list.push(child);
            });
        }
        // Cap to keep raycasts cheap
        this._occluders = list.slice(0, 120);
        return this._occluders;
    }

    invalidateOccluders() {
        this._occluders = null;
    }

    createLabel(pathology) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label-element';
        labelDiv.id = 'label-' + pathology.id;

        let sevClass = 'sev-low';
        if (pathology.severity === 'Orta') sevClass = 'sev-medium';
        else if (pathology.severity === 'Yüksek') sevClass = 'sev-high';
        else if (pathology.severity === 'Kritik') sevClass = 'sev-critical';

        labelDiv.classList.add(sevClass);

        const cleanTitle = pathology.title ? pathology.title.split('(')[0].trim() : '';

        labelDiv.innerHTML = `
            <div class="label-inner" title="${cleanTitle}">
                <span class="label-dot"><span class="label-ping"></span><span class="label-core"></span></span>
                <span class="label-text">${cleanTitle}</span>
            </div>
        `;

        labelDiv.style.pointerEvents = 'auto';

        const inner = labelDiv.querySelector('.label-inner');
        inner.addEventListener('mouseenter', () => {
            this._hoveredId = pathology.id;
            if (this.onLabelHover) this.onLabelHover(pathology.id);
        });
        inner.addEventListener('mouseleave', () => {
            if (this._hoveredId === pathology.id) this._hoveredId = null;
            if (this.onLabelHover) this.onLabelHover(null);
        });

        labelDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.labels.forEach((d) => d.element.classList.remove('is-active'));
            labelDiv.classList.add('is-active');
            if (this.onLabelClick) this.onLabelClick(pathology.id);
        });

        const css2dObject = new CSS2DObject(labelDiv);
        const coords = pathology.hotspotCoordinates || { x: 0, y: 0, z: 0 };
        css2dObject.position.set(coords.x, coords.y, coords.z);

        this.scene.add(css2dObject);

        this.labels.set(pathology.id, {
            css2dObject,
            element: labelDiv,
            pathology,
            position: new THREE.Vector3(coords.x, coords.y, coords.z)
        });
    }

    updatePositions(markers) {
        if (!this.camera || !this.modelGroup) return;

        this._frame++;
        const runOcclusion = this._frame % 6 === 0;
        const cameraPos = this.camera.position;
        const occluders = runOcclusion ? this.getOccluders() : null;

        this.labels.forEach((data, id) => {
            const marker = markers ? markers.find(m => m.id === id) : null;
            const isVisible = marker ? marker.group.visible : true;

            if (!isVisible) {
                data.element.style.opacity = '0';
                data.element.style.pointerEvents = 'none';
                return;
            }

            let isOccluded = this._occlusionCache.get(id) || false;

            if (runOcclusion && occluders && occluders.length) {
                const targetPos = data.position;
                const direction = targetPos.clone().sub(cameraPos).normalize();
                const maxDistance = cameraPos.distanceTo(targetPos);

                this.raycaster.set(cameraPos, direction);
                const intersects = this.raycaster.intersectObjects(occluders, false);

                isOccluded = false;
                if (intersects.length > 0 && intersects[0].distance < maxDistance - 0.4) {
                    isOccluded = true;
                }
                this._occlusionCache.set(id, isOccluded);
            }

            if (isOccluded) {
                data.element.style.opacity = '0.2';
                data.element.style.pointerEvents = 'none';
                data.element.classList.remove('is-active');
            } else {
                data.element.style.opacity = '1';
                data.element.style.pointerEvents = 'auto';
            }
        });
    }

    setVisibility(id, visible) {
        const data = this.labels.get(id);
        if (!data) return;
        data.element.style.display = visible ? '' : 'none';
        data.css2dObject.visible = visible;
    }

    onLabelClicked(callback) {
        this.onLabelClick = callback;
    }

    onLabelHovered(callback) {
        this.onLabelHover = callback;
    }

    setActive(id) {
        this.labels.forEach((data, key) => {
            data.element.classList.toggle('is-active', key === id);
        });
    }

    /** Sync CSS2D anchors after anatomy mesh bind */
    repositionFromPathologies() {
        this.labels.forEach((data) => {
            const coords = data.pathology.hotspotCoordinates;
            if (!coords) return;
            data.css2dObject.position.set(coords.x, coords.y, coords.z);
            data.position.set(coords.x, coords.y, coords.z);
        });
        this._occlusionCache.clear();
    }
}
