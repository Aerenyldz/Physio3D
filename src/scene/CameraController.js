import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export class CameraController {
  constructor(domElement) {
    const width = domElement.clientWidth || window.innerWidth;
    const height = domElement.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
    this.defaultPosition = new THREE.Vector3(0, 7.5, 18);
    this.defaultTarget = new THREE.Vector3(0, 7.5, 0);

    this.camera.position.copy(this.defaultPosition);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.target.copy(this.defaultTarget);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxDistance = 38;
    this.controls.minDistance = 6;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;

    this.controls.update();
  }

  getCamera() {
    return this.camera;
  }
  getControls() {
    return this.controls;
  }

  update() {
    this.controls.update();
  }

  animateTo(position, target, duration = 1.2) {
    gsap.to(this.camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration,
      ease: 'power3.inOut',
    });

    gsap.to(this.controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => this.controls.update(),
    });
  }

  /**
   * Frame a focus point from outside the body — never dive inside.
   * @param {{x:number,y:number,z:number}} lookAt
   * @param {{ distance?: number, duration?: number }} [opts]
   */
  animateToFocus(lookAt, opts = {}) {
    const focus = new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z);
    const distance = opts.distance ?? 10;
    const duration = opts.duration ?? 1.15;

    // Prefer viewing from the side the structure faces (front vs back)
    const view = new THREE.Vector3(focus.x * 0.22, 0.15, focus.z < -0.25 ? -1 : 1);
    if (view.lengthSq() < 0.01) view.set(0, 0.1, 1);
    view.normalize();

    const position = focus.clone().addScaledVector(view, distance);
    // Keep camera slightly above focus for a natural clinical view
    position.y = Math.max(position.y, focus.y + 0.4);

    // Hard clamp: never closer than minDistance to focus
    const minD = Math.max(this.controls.minDistance, 7);
    if (position.distanceTo(focus) < minD) {
      position.copy(focus).addScaledVector(view, minD);
    }

    this.animateTo(position, focus, duration);
  }

  resetToDefault(duration = 1.2) {
    this.animateTo(this.defaultPosition, this.defaultTarget, duration);
  }

  getDefaultPosition() {
    return this.defaultPosition.clone();
  }
  getDefaultTarget() {
    return this.defaultTarget.clone();
  }
}
