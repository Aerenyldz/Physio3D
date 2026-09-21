import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/** Target standing height in scene units (matches pathology hotspot Y range ~0–16). */
const TARGET_BODY_HEIGHT = 16.0;

export class ModelLoader {
  constructor(modelGroup) {
    this.modelGroup = modelGroup;
    this.gltfLoader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  loadModel(url, onProgress) {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const useFallback = (reason) => {
        console.warn('GLB yüklenemedi, prosedürel model kullanılıyor:', reason);
        try {
          const body = this.createProceduralBody();
          this.modelGroup.add(body);
          finish(body);
        } catch (err) {
          console.error('Prosedürel model hatası:', err);
          finish(null);
        }
      };

      this.gltfLoader.load(
        url,
        (gltf) => {
          try {
            const root = this.prepareAnatomicalModel(gltf.scene);
            this.modelGroup.add(root);
            console.log('✅ Anatomik GLB model yüklendi ve sahneye yerleştirildi');
            finish(root);
          } catch (err) {
            useFallback(err);
          }
        },
        onProgress,
        (error) => useFallback(error)
      );
    });
  }

  /**
   * Scale, ground, and style a Z-Anatomy / ecorché GLB so it fits
   * the existing pathology hotspot coordinate system.
   */
  prepareAnatomicalModel(scene) {
    const wrapper = new THREE.Group();
    wrapper.name = 'AnatomicalBody';
    wrapper.add(scene);

    // Shared materials (826 unique clones destroyed FPS)
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xf0e6d4,
      roughness: 0.62,
      metalness: 0.08,
      emissive: 0x12100c,
      emissiveIntensity: 0.03,
    });
    const muscleMat = new THREE.MeshStandardMaterial({
      color: 0x7a2428,
      roughness: 0.58,
      metalness: 0.06,
      emissive: 0x180606,
      emissiveIntensity: 0.08,
    });
    const softMat = new THREE.MeshStandardMaterial({
      color: 0xb8956e,
      roughness: 0.7,
      metalness: 0.02,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });

    // Measure unscaled bounds
    wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    if (size.y < 0.001) {
      throw new Error('Model bounding box invalid');
    }

    const scale = TARGET_BODY_HEIGHT / size.y;
    wrapper.scale.setScalar(scale);

    wrapper.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale
    );

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const type = (child.userData?.type || '').toLowerCase();
      const name = `${child.name || ''} ${child.userData?.name || ''}`.toLowerCase();

      const isBone =
        type === 'bone' ||
        /bone|vertebra|skull|cranium|femur|tibia|humerus|radius|ulna|scapula|clavicle|pelvis|rib|sternum|patella|mandible|atlas|axis/.test(
          name
        );
      const isMuscle =
        type === 'muscle' ||
        /muscle|musculus|pectoral|deltoid|bicep|tricep|quad|hamstring|glute|latissimus|trapezius|gastroc|soleus|rectus/.test(
          name
        );

      // Clean ecorché: hide bursas / tiny soft tissue that muddy the silhouette
      if (!isBone && !isMuscle && type !== 'bone' && type !== 'muscle') {
        if (/bursa|ligament|cartilage|fascia|skin|organ|vessel|nerve|tendon/.test(name)) {
          child.visible = false;
          return;
        }
      }

      child.material = isBone ? boneMat : isMuscle ? muscleMat : softMat;
      child.userData.anatType = isBone ? 'bone' : isMuscle ? 'muscle' : 'soft';
      child.castShadow = isMuscle || (isBone && !/tooth|incisor|molar|stapes|malleus|incus/.test(name));
      child.receiveShadow = true;
      child.frustumCulled = true;
    });

    return wrapper;
  }

  styleMesh() {
    // Materials applied in prepareAnatomicalModel via shared mats
  }

  createMuscleFiberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6e2222';
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 1;
    for (let i = 0; i < 500; i++) {
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.4 + 0.1;
      const bright = Math.floor(Math.random() * 80 + 120);
      const greenVal = Math.floor(bright / 3);
      ctx.strokeStyle = `rgba(${bright + 40}, ${greenVal}, ${greenVal}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  createProceduralBody() {
    const bodyGroup = new THREE.Group();
    const muscleTexture = this.createMuscleFiberTexture();

    const boneMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfd3be,
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });

    const muscleMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b2525,
      map: muscleTexture,
      roughness: 0.45,
      metalness: 0.08,
      clearcoat: 0.25,
      emissive: 0x220505,
      emissiveIntensity: 0.2,
    });

    const darkMuscleMat = new THREE.MeshPhysicalMaterial({
      color: 0x661818,
      map: muscleTexture,
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.15,
    });

    const tendonMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4c29c,
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.3,
    });

    const addPart = (geo, mat, pos, scale = [1, 1, 1], rot = [0, 0, 0]) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rot);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      bodyGroup.add(mesh);
      return mesh;
    };

    addPart(new THREE.SphereGeometry(0.85, 48, 48), boneMat, [0, 15.4, 0], [0.95, 1.15, 1.05]);
    addPart(new THREE.SphereGeometry(0.42, 32, 32), boneMat, [0, 14.65, 0.35], [1.15, 0.75, 1.0]);
    addPart(new THREE.CylinderGeometry(0.2, 0.28, 0.5, 16), boneMat, [0, 14.3, 0.25], [1, 1, 0.8]);

    addPart(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 32), darkMuscleMat, [0, 14.1, -0.05]);
    addPart(new THREE.CylinderGeometry(0.12, 0.14, 1.0, 16), muscleMat, [-0.25, 14.1, 0.15], [1, 1, 1], [0, 0, -0.15]);
    addPart(new THREE.CylinderGeometry(0.12, 0.14, 1.0, 16), muscleMat, [0.25, 14.1, 0.15], [1, 1, 1], [0, 0, 0.15]);

    for (let i = 0; i < 22; i++) {
      const t = i / 21;
      const py = 7.5 + (13.7 - 7.5) * t;
      const pz = -0.32 + Math.sin(t * Math.PI) * 0.18;
      addPart(new THREE.CylinderGeometry(0.26, 0.28, 0.22, 16), boneMat, [0, py, pz]);
    }

    addPart(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16), boneMat, [0, 13.3, 0.45], [1, 1, 1], [0, 0, Math.PI / 2]);
    addPart(new THREE.BoxGeometry(0.35, 2.2, 0.15), boneMat, [0, 12.2, 0.72]);

    addPart(new THREE.SphereGeometry(0.85, 32, 32), muscleMat, [-1.15, 12.4, 0.55], [1.35, 0.85, 0.65], [0.1, 0.2, -0.1]);
    addPart(new THREE.SphereGeometry(0.85, 32, 32), muscleMat, [1.15, 12.4, 0.55], [1.35, 0.85, 0.65], [0.1, -0.2, 0.1]);

    addPart(new THREE.SphereGeometry(0.78, 32, 32), muscleMat, [-3.0, 13.1, 0.05], [1.1, 1.25, 1.1]);
    addPart(new THREE.SphereGeometry(0.78, 32, 32), muscleMat, [3.0, 13.1, 0.05], [1.1, 1.25, 1.1]);

    addPart(new THREE.CylinderGeometry(0.42, 0.35, 3.0, 24), darkMuscleMat, [-3.2, 11.2, 0]);
    addPart(new THREE.SphereGeometry(0.42, 24, 24), muscleMat, [-3.2, 11.3, 0.25], [0.9, 1.4, 0.9]);
    addPart(new THREE.SphereGeometry(0.45, 24, 24), tendonMat, [-3.2, 9.4, 0]);
    addPart(new THREE.CylinderGeometry(0.38, 0.26, 2.8, 24), muscleMat, [-3.2, 7.8, 0.05]);
    addPart(new THREE.BoxGeometry(0.28, 0.75, 0.45), boneMat, [-3.2, 6.0, 0.05]);

    addPart(new THREE.CylinderGeometry(0.42, 0.35, 3.0, 24), darkMuscleMat, [3.2, 11.2, 0]);
    addPart(new THREE.SphereGeometry(0.42, 24, 24), muscleMat, [3.2, 11.3, 0.25], [0.9, 1.4, 0.9]);
    addPart(new THREE.SphereGeometry(0.45, 24, 24), tendonMat, [3.2, 9.4, 0]);
    addPart(new THREE.CylinderGeometry(0.38, 0.26, 2.8, 24), muscleMat, [3.2, 7.8, 0.05]);
    addPart(new THREE.BoxGeometry(0.28, 0.75, 0.45), boneMat, [3.2, 6.0, 0.05]);

    addPart(new THREE.CylinderGeometry(1.35, 1.25, 2.4, 32), darkMuscleMat, [0, 10.3, 0.15]);
    for (let r = 0; r < 3; r++) {
      const absY = 11.2 - r * 0.65;
      addPart(new THREE.BoxGeometry(0.48, 0.5, 0.25), muscleMat, [-0.32, absY, 0.72]);
      addPart(new THREE.BoxGeometry(0.48, 0.5, 0.25), muscleMat, [0.32, absY, 0.72]);
    }

    addPart(new THREE.SphereGeometry(1.15, 32, 32), muscleMat, [0, 13.7, -0.45], [1.7, 0.6, 0.6]);
    addPart(new THREE.SphereGeometry(1.2, 32, 32), muscleMat, [-1.4, 11.5, -0.4], [0.7, 1.6, 0.5]);
    addPart(new THREE.SphereGeometry(1.2, 32, 32), muscleMat, [1.4, 11.5, -0.4], [0.7, 1.6, 0.5]);

    addPart(new THREE.CylinderGeometry(1.45, 1.2, 1.5, 32), boneMat, [0, 8.2, 0]);
    addPart(new THREE.SphereGeometry(0.95, 32, 32), muscleMat, [-0.85, 7.9, -0.65], [1.1, 1.1, 1.1]);
    addPart(new THREE.SphereGeometry(0.95, 32, 32), muscleMat, [0.85, 7.9, -0.65], [1.1, 1.1, 1.1]);

    addPart(new THREE.CylinderGeometry(0.65, 0.48, 3.6, 32), darkMuscleMat, [-0.95, 5.6, 0]);
    addPart(new THREE.SphereGeometry(0.55, 24, 24), muscleMat, [-0.95, 5.8, 0.25], [1.0, 1.6, 0.9]);
    addPart(new THREE.SphereGeometry(0.48, 24, 24), tendonMat, [-0.95, 3.6, 0.15]);
    addPart(new THREE.CylinderGeometry(0.48, 0.32, 3.4, 32), muscleMat, [-0.95, 1.7, -0.05]);
    addPart(new THREE.SphereGeometry(0.38, 24, 24), tendonMat, [-0.95, -0.2, 0]);
    addPart(new THREE.BoxGeometry(0.58, 0.35, 1.4), tendonMat, [-0.95, -0.4, 0.35]);

    addPart(new THREE.CylinderGeometry(0.65, 0.48, 3.6, 32), darkMuscleMat, [0.95, 5.6, 0]);
    addPart(new THREE.SphereGeometry(0.55, 24, 24), muscleMat, [0.95, 5.8, 0.25], [1.0, 1.6, 0.9]);
    addPart(new THREE.SphereGeometry(0.48, 24, 24), tendonMat, [0.95, 3.6, 0.15]);
    addPart(new THREE.CylinderGeometry(0.48, 0.32, 3.4, 32), muscleMat, [0.95, 1.7, -0.05]);
    addPart(new THREE.SphereGeometry(0.38, 24, 24), tendonMat, [0.95, -0.2, 0]);
    addPart(new THREE.BoxGeometry(0.58, 0.35, 1.4), tendonMat, [0.95, -0.4, 0.35]);

    return bodyGroup;
  }
}
