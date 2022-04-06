import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: TrackballControls;
  private objects: Array<THREE.Mesh> = [];
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    // 初始化变量
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;

    // 初始化场景
    this.setScene();
    this.setCamera();
    this.setLight();
    this.setRenderer();
    this.setMesh();
    this.setControls();

    // 添加事件
		this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      60,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      1000
    );
    this.camera.position.z = 500;
  }

  private setLight(): void {
    const dirLight1 = new THREE.DirectionalLight(0xffffff);
		dirLight1.position.set(1, 1, 1);
		this.scene.add(dirLight1);

		const dirLight2 = new THREE.DirectionalLight(0x002288);
		dirLight2.position.set(-1, -1, -1);
		this.scene.add(dirLight2);

		const ambientLight = new THREE.AmbientLight(0x222222);
		this.scene.add(ambientLight);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.container.appendChild(this.renderer.domElement);
  }

  private setMesh(): void {
    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			flatShading: true
		});
		for (let i = 0; i < 500; i++) {
			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = (Math.random() - 0.5) * 1000;
			mesh.position.y = (Math.random() - 0.5) * 1000;
			mesh.position.z = (Math.random() - 0.5) * 1000;
			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;
			this.scene.add(mesh);
		}
  }

  private setControls(): void {
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
		this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 1.2;
		this.controls.panSpeed = 0.8
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
		this.controls.update();
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }
}
export default Three;
