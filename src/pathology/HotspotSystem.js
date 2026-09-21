import * as THREE from 'three';

export class HotspotSystem {
    constructor(scene) {
        this.scene = scene;
        this.markers = [];
        this.interactableObjects = [];
        this.severityColors = {
            'Düşük': { core: 0x22c55e, halo: 0x4ade80 },
            'Orta': { core: 0xf59e0b, halo: 0xfbbf24 },
            'Yüksek': { core: 0xef4444, halo: 0xf87171 },
            'Kritik': { core: 0xdc2626, halo: 0xff0000 }
        };
    }

    createMarker(pathology) {
        const coords = pathology.hotspotCoordinates || { x: 0, y: 0, z: 0 };
        const colors = this.severityColors[pathology.severity] || this.severityColors['Düşük'];

        const group = new THREE.Group();
        group.position.set(coords.x, coords.y, coords.z);

        // Tiny invisible hit target — visible UI is CSS2D dots
        const coreGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({
            color: colors.core,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.userData = { id: pathology.id };

        const haloGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const haloMat = new THREE.MeshBasicMaterial({
            color: colors.halo,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.userData = { id: pathology.id };

        // Keep ring but fully transparent (legacy animateMarkers expects it)
        const ringGeo = new THREE.RingGeometry(0.2, 0.22, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colors.halo,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);

        group.add(core);
        group.add(halo);
        group.add(ring);

        this.scene.add(group);

        this.markers.push({ group, core, halo, ring, id: pathology.id, pathology });
        this.interactableObjects.push(core, halo);
    }

    /** Re-read pathology.hotspotCoordinates after anatomy bind */
    repositionFromPathologies() {
        this.markers.forEach((marker) => {
            const coords = marker.pathology.hotspotCoordinates;
            if (!coords) return;
            marker.group.position.set(coords.x, coords.y, coords.z);
        });
    }

    animateMarkers(elapsedTime, camera) {
        this.markers.forEach((marker, i) => {
            const pulse = Math.sin(elapsedTime * 2.5 + i * 0.7) * 0.08 + 1;
            marker.halo.scale.set(pulse, pulse, pulse);
            if (camera) {
                marker.ring.lookAt(camera.position);
            }
        });
    }

    setMarkerVisibility(id, visible) {
        const marker = this.markers.find(m => m.id === id);
        if (marker) {
            marker.group.visible = visible;
        }
    }

    getMarkers() {
        return this.markers;
    }

    getInteractableObjects() {
        return this.interactableObjects;
    }
}
