import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

class Three {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;

		// 初始化场景
    this.scene = new THREE.Scene();
    this.init();
  }

  private init(): void {
    this.setCamera();
    this.setLight();
    this.setRenderer();
    this.setGui();
    this.setModel();
    // this.setGui();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      0.01,
      2000
    );
    this.camera.position.set(0, 0, this.perspectiveDistance);
  }

  private setLight(): void {
    this.scene.add(new THREE.HemisphereLight(0x443333, 0x222233, 4));
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 3;
    this.renderer.domElement.style.background =
      'linear-gradient( 180deg, rgba( 0,0,0,1 ) 0%, rgba( 128,128,255,1 ) 100% )';

    this.container.appendChild(this.renderer.domElement);
  }

  public animate(): void {
    this.render();
  }

  private render = () => {
    if (this.renderer && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    }
  }

  public destroy(): void {
    if (this.gui) {
			this.gui.destroy();
    }
  }
}
export default Three;
