import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { CameraController } from './CameraController.js';
import { LightingSystem } from './LightingSystem.js';
import { ModelLoader } from './ModelLoader.js';
import { EffectsManager } from './EffectsManager.js';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080c18');
    this.scene.fog = new THREE.FogExp2('#080c18', 0.012);

    const canvasContainer = document.getElementById('canvas-container');
    const width = canvasContainer ? canvasContainer.clientWidth : window.innerWidth;
    const height = canvasContainer ? canvasContainer.clientHeight : window.innerHeight;

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    if (canvasContainer) {
      canvasContainer.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }

    // CSS2D Renderer for 3D Anchored Labels
    this.css2dRenderer = new CSS2DRenderer();
    this.css2dRenderer.setSize(width, height);
    this.css2dRenderer.domElement.style.position = 'absolute';
    this.css2dRenderer.domElement.style.top = '0px';
    this.css2dRenderer.domElement.style.left = '0px';
    this.css2dRenderer.domElement.style.pointerEvents = 'none';
    this.css2dRenderer.domElement.style.zIndex = '15';

    const labelsContainer = document.getElementById('labels-container');
    if (labelsContainer) {
      labelsContainer.appendChild(this.css2dRenderer.domElement);
    } else {
      document.body.appendChild(this.css2dRenderer.domElement);
    }

    this.cameraController = new CameraController(this.renderer.domElement);
    this.lightingSystem = new LightingSystem(this.scene);
    
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);
    
    this.modelLoader = new ModelLoader(this.modelGroup);
    this.effectsManager = new EffectsManager(this.renderer, this.scene, this.cameraController.getCamera());

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // GridHelper
    const gridHelper = new THREE.GridHelper(50, 50, 0x1e2945, 0x111828);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Particle system
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.6
    });
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Resize handler
    window.addEventListener('resize', this.onResize.bind(this));

    this.clock = new THREE.Clock();
  }

  updateParticles(delta) {
    if (this.particles) {
      this.particles.rotation.y += 0.05 * delta;
    }
  }

  onResize() {
    const canvasContainer = document.getElementById('canvas-container');
    const width = canvasContainer ? canvasContainer.clientWidth : window.innerWidth;
    const height = canvasContainer ? canvasContainer.clientHeight : window.innerHeight;

    const camera = this.cameraController.getCamera();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.css2dRenderer) {
      this.css2dRenderer.setSize(width, height);
    }
    if (this.effectsManager) {
      this.effectsManager.onResize(width, height);
    }
  }

  async loadModel() {
    const progressBar = document.getElementById('loader-progress');
    try {
      await this.modelLoader.loadModel('/models/muscular_skeleton.glb', (xhr) => {
        if (xhr.lengthComputable && progressBar) {
          progressBar.style.width = Math.min(100, (xhr.loaded / xhr.total) * 100) + '%';
        } else if (progressBar && xhr.loaded) {
          // Indeterminate progress for compressed streams
          progressBar.style.width = Math.min(90, progressBar.offsetWidth ? 40 : 25) + '%';
        }
      });
      if (progressBar) progressBar.style.width = '100%';
    } catch (e) {
      // Fallback handled in ModelLoader
      console.warn('loadModel catch:', e);
    }
  }

  render() {
    const camera = this.cameraController.getCamera();
    if (this.effectsManager) {
      this.effectsManager.render();
    } else {
      this.renderer.render(this.scene, camera);
    }

    if (this.css2dRenderer) {
      this.css2dRenderer.render(this.scene, camera);
    }
  }

  getScene() { return this.scene; }
  getCamera() { return this.cameraController.getCamera(); }
  getRenderer() { return this.renderer; }
  getCss2dRenderer() { return this.css2dRenderer; }
  getCameraController() { return this.cameraController; }
  getModelGroup() { return this.modelGroup; }
  getClock() { return this.clock; }
}
