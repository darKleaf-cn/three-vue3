import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private clock: THREE.Clock;
  private mixer!: THREE.AnimationMixer;
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    // 初始化变量
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
    this.clock = new THREE.Clock();

    // 初始化场景
    this.setRenderer();
    this.setScene();
    this.setCamera();
    this.setControls();
    this.setLoader();

    // 添加事件
    this.onWindowResize = this.onWindowResize.bind(this);

    window.addEventListener('resize', this.onWindowResize);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe3dd);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      40,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      100
    );
    this.camera.position.set(5, 2, 8);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
  }

  private setLoader(): void {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./static/js/gltf/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      './static/models/gltf/LittlestTokyo.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);
        this.scene.add(model);

        this.mixer = new THREE.AnimationMixer(model);
        this.mixer.clipAction(gltf.animations[0]).play();

        this.start();
      });
  }

  private setControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
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
    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }
    this.controls.update();
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
    const arr = this.scene.children.filter((x) => x);
    arr.forEach((mesh: THREE.Object3D) => {
      if (mesh instanceof THREE.Mesh) {
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          mesh.material.dispose();
        }
        if (mesh.material.texture) {
          mesh.material.texture.dispose();
        }
      }
      if (mesh instanceof THREE.Group) {
        mesh.clear();
      }
      if (mesh instanceof THREE.Object3D) {
        mesh.clear();
      }
    });

    THREE.Cache.clear();
    this.controls.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.container.removeChild(this.renderer.domElement);
  }
}
export default Three;
