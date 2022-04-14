import * as THREE from 'three';
// import { DirectionalLightShadow } from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    // 初始化变量
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
    // this.clock = new THREE.Clock();

    // 初始化场景
    this.setRenderer();
    this.setScene();
    this.setCamera();
    this.setLight();
    // this.setLoader();

    // 添加事件
    this.onWindowResize = this.onWindowResize.bind(this);

    window.addEventListener('resize', this.onWindowResize);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);
		this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      1000
    );
    this.camera.position.set(2, 3, -6);
		this.camera.lookAt(0, 1, 0);
  }

	private setLight(): void {
		// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
		// hemiLight.position.set(0, 20, 0);
		// this.scene.add(hemiLight);

		// const dirLight = new THREE.DirectionalLight(0xfffffff);
		// dirLight.position.set(-3, 10, -10);
		// dirLight.castShadow = true;
	}

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
  }

  private render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    this.camera.aspect = (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.render();
  }

  public start = (): void => {
    requestAnimationFrame(this.start);
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }
}
export default Three;
