import * as THREE from 'three';

/**
 * Soft emissive glow + x-ray ghosting of covering muscles.
 * Shared materials are cloned per-mesh so opacity/emissive stay local.
 */
export class MuscleHighlight {
  constructor() {
    this.activeId = null;
    this.activeMeshes = [];
    this.ghostedMeshes = [];
    this._pulse = 0;
    this._raf = null;
  }

  /**
   * @param {string} pathologyId
   * @param {THREE.Mesh[]} meshes
   * @param {{ color?: number, intensity?: number, modelGroup?: THREE.Object3D, xray?: boolean }} [opts]
   */
  highlight(pathologyId, meshes, opts = {}) {
    if (!meshes?.length) return;
    if (this.activeId === pathologyId) return;

    this.clear();
    this.activeId = pathologyId;

    const color = opts.color ?? 0xff6b4a;
    const baseIntensity = opts.intensity ?? 0.55;
    const highlightSet = new Set(meshes.filter((m) => m?.isMesh));

    highlightSet.forEach((mesh) => {
      this._ensureBase(mesh);
      if (!mesh.userData._hlMat) {
        mesh.userData._hlMat = mesh.userData._baseMat.clone();
      }

      const mat = mesh.userData._hlMat;
      mat.transparent = false;
      mat.opacity = 1;
      mat.depthWrite = true;
      if (mat.emissive) {
        mat.emissive.setHex(color);
        mat.emissiveIntensity = baseIntensity;
      }
      if ('roughness' in mat) mat.roughness = Math.max(0.22, (mat.roughness ?? 0.5) - 0.15);
      mat.needsUpdate = true;
      mesh.material = mat;
      mesh.renderOrder = 3;

      this.activeMeshes.push({ mesh, baseIntensity });
    });

    if (opts.xray !== false && opts.modelGroup) {
      this._applyXray(opts.modelGroup, highlightSet);
    }

    this._startPulse();
  }

  _ensureBase(mesh) {
    if (!mesh.userData._baseMat) {
      mesh.userData._baseMat = mesh.material;
    }
  }

  /**
   * Fade covering muscles/soft tissue so deep targets become visible.
   * Bones stay slightly more opaque as anatomical landmarks.
   */
  _applyXray(modelGroup, highlightSet) {
    const center = new THREE.Vector3();
    let n = 0;
    highlightSet.forEach((mesh) => {
      center.add(this._meshCenter(mesh));
      n += 1;
    });
    if (n) center.multiplyScalar(1 / n);

    // Soft falloff radius around the focus — full fade near target, lighter farther
    const nearR = 3.2;
    const farR = 7.5;

    modelGroup.traverse((child) => {
      if (!child.isMesh || !child.visible) return;
      if (highlightSet.has(child)) return;

      const type = child.userData.anatType || 'muscle';
      if (type === 'soft' && child.material?.opacity != null && child.material.opacity < 0.35) {
        // Already translucent soft tissue — leave alone
        return;
      }

      const dist = this._meshCenter(child).distanceTo(center);
      if (dist > farR && type === 'bone') return;

      let opacity;
      if (type === 'bone') {
        // Keep bones readable but lightly see-through near focus
        opacity = dist < nearR ? 0.35 : dist < farR ? 0.55 : 0.85;
      } else {
        // Muscles: strong ghost near focus so internal glow shows through
        const t = THREE.MathUtils.clamp((dist - nearR) / (farR - nearR), 0, 1);
        opacity = THREE.MathUtils.lerp(0.08, 0.28, t);
        if (dist > farR) opacity = 0.42;
      }

      this._ensureBase(child);
      if (!child.userData._ghostMat) {
        child.userData._ghostMat = child.userData._baseMat.clone();
      }

      const mat = child.userData._ghostMat;
      mat.transparent = true;
      mat.opacity = opacity;
      mat.depthWrite = false;
      if (mat.emissiveIntensity != null) mat.emissiveIntensity = 0.02;
      mat.needsUpdate = true;
      child.material = mat;
      child.renderOrder = type === 'bone' ? 1 : 0;

      this.ghostedMeshes.push(child);
    });
  }

  _meshCenter(mesh, out = new THREE.Vector3()) {
    if (!mesh.geometry) return mesh.getWorldPosition(out);
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox.clone();
    box.applyMatrix4(mesh.matrixWorld);
    return box.getCenter(out);
  }

  _startPulse() {
    this._stopPulse();
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      const wave = 0.85 + Math.sin(t * 3.2) * 0.15;
      this.activeMeshes.forEach(({ mesh, baseIntensity }) => {
        const mat = mesh.material;
        if (mat?.emissiveIntensity != null) {
          mat.emissiveIntensity = baseIntensity * wave;
        }
      });
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _stopPulse() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  clear() {
    this._stopPulse();

    this.activeMeshes.forEach(({ mesh }) => {
      if (mesh.userData._baseMat) {
        mesh.material = mesh.userData._baseMat;
      }
      mesh.renderOrder = 0;
    });

    this.ghostedMeshes.forEach((mesh) => {
      if (mesh.userData._baseMat) {
        mesh.material = mesh.userData._baseMat;
      }
      mesh.renderOrder = 0;
    });

    this.activeMeshes = [];
    this.ghostedMeshes = [];
    this.activeId = null;
  }
}
