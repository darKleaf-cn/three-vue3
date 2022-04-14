import * as THREE from 'three';
export default interface OfficialThree {
  scene: THREE.Scene;
  container: HTMLElement;
  offsetX: number;
  offsetY: number;
  start(): void;
  end(): void;
}
