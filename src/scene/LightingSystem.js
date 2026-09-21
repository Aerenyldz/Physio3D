import * as THREE from 'three';

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};

    // Soft clinical fill
    this.lights.ambient = new THREE.AmbientLight(0xb8c4d8, 0.55);
    this.scene.add(this.lights.ambient);

    this.lights.hemisphere = new THREE.HemisphereLight(0xe8f0ff, 0x1a2030, 0.75);
    this.lights.hemisphere.position.set(0, 20, 0);
    this.scene.add(this.lights.hemisphere);

    // Key light
    this.lights.directional = new THREE.DirectionalLight(0xfff5eb, 1.35);
    this.lights.directional.position.set(6, 18, 10);
    this.lights.directional.castShadow = true;
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;
    this.lights.directional.shadow.camera.near = 1;
    this.lights.directional.shadow.camera.far = 50;
    this.lights.directional.shadow.camera.left = -12;
    this.lights.directional.shadow.camera.right = 12;
    this.lights.directional.shadow.camera.top = 20;
    this.lights.directional.shadow.camera.bottom = -2;
    this.lights.directional.shadow.bias = -0.0002;
    this.scene.add(this.lights.directional);

    // Cool rim (subtle anatomy separation)
    this.lights.blueRim = new THREE.PointLight(0x7ec8e3, 1.8, 45);
    this.lights.blueRim.position.set(-10, 12, -8);
    this.scene.add(this.lights.blueRim);

    // Warm fill from front-right
    this.lights.warmFill = new THREE.PointLight(0xffe0c8, 1.2, 35);
    this.lights.warmFill.position.set(8, 8, 12);
    this.scene.add(this.lights.warmFill);

    // Soft underside bounce
    this.lights.bounce = new THREE.PointLight(0xa0b4d0, 0.7, 30);
    this.lights.bounce.position.set(0, 2, 6);
    this.scene.add(this.lights.bounce);
  }

  setIntensity(name, value) {
    if (this.lights[name]) {
      this.lights[name].intensity = value;
    }
  }

  toggleLight(name, enabled) {
    if (this.lights[name]) {
      this.lights[name].visible = enabled;
    }
  }
}
