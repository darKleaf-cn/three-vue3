import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private orbitControl!: OrbitControls;
  private transformControl!: TransformControls;
  private mesh!: THREE.Mesh;
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
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);

    window.addEventListener('resize', this.onWindowResize);
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.GridHelper(1000, 10, 0x888888, 0x444444));
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      50,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      0.01,
      30000
    );
    this.camera.position.set(1000, 500, 1000);
    this.camera.lookAt(0, 200, 0);
  }

  private setLight(): void {
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.container.appendChild(this.renderer.domElement);
  }

  private setMesh(): void {
    const texture = new THREE.TextureLoader().load('./static/textures/crate.gif', this.render);
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  private setControls(): void {
    this.orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControl.update();
    this.orbitControl.addEventListener('change', this.render);

    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.addEventListener('change', this.render);
    this.transformControl.addEventListener('dragging-changed', (e: THREE.Event) => {
      this.orbitControl.enabled = !e.value;
    });
    this.transformControl.attach(this.mesh);
    this.scene.add(this.transformControl);
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

  private onKeyDown(e: KeyboardEvent): void {
    switch (e.keyCode) {
      case 81: // Q
        this.transformControl.setSpace(this.transformControl.space === 'local' ? 'world' : 'local');
        break;
      case 16: // shift
        this.transformControl.setTranslationSnap(100);
        break;
      case 87: // w
        this.transformControl.setMode('translate');
        break;
      case 69: // e
        this.transformControl.setMode('rotate');
        break;
      case 82: // r
        this.transformControl.setMode('scale');
        break;
      case 67: // c
        // 切换相机类型
        break;
      case 86: // v
        this.camera.fov = (Math.random() + 0.1) * 160;
        this.camera.zoom = (Math.random() + 0.1) * 5;
				break;
			case 187:
			case 107: // +, =, num+
				this.transformControl.setSize(this.transformControl.size + 0.1);
				break;
			case 189:
			case 109: // -, _, num-
				this.transformControl.setSize(Math.max(this.transformControl.size - 0.1, 0.1));
				break;
			case 88: // x
				this.transformControl.showX = !this.transformControl.showX;
				break;
			case 89: // y
				this.transformControl.showY = !this.transformControl.showY;
				break;
			case 90: // z
				this.transformControl.showZ = !this.transformControl.showZ;
				break;
			case 32: // spacebar
				this.transformControl.enabled = !this.transformControl.enabled;
				break;
			case 27: // esc
				this.transformControl.reset();
				break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    switch (e.keyCode) {
      case 16: // shift
        this.transformControl.setTranslationSnap(null);
        this.transformControl.setRotationSnap(null);
        this.transformControl.setScaleSnap(null);
        break;
    }
  }

  public start = (): void => {
    requestAnimationFrame(this.start);
    this.orbitControl.update();
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }
}
export default Three;
