import * as THREE from 'three';

/**
 * Lightweight post path — full bloom/SMAA on 800+ anatomy meshes tanks FPS.
 * We keep tone mapping on the renderer and skip the EffectComposer stack.
 */
export class EffectsManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.composer = null;
    this.bloomPass = null;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize(/* width, height */) {
    // no-op without composer
  }

  setBloomStrength(/* value */) {}
  setBloomThreshold(/* value */) {}

  getComposer() {
    return this.composer;
  }
}
