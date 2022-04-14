import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: MapControls;
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
    this.camera.position.set(400, 200, 0);
  }

  private setLight(): void {
    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(1, 1, 1);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288);
    dirLight2.position.set(-1, -1, -1);
		this.scene.add(dirLight2)

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
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true
    });

    for (let i = 0; i < 500; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 1600 - 800;
      mesh.position.y = 0;
      mesh.position.z = Math.random() * 1600 - 800;
      mesh.scale.x = 20;
      mesh.scale.y = Math.random() * 80 + 10;
      mesh.scale.z = 20;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;

      this.scene.add(mesh);
    }
  }

  private setControls(): void {
    this.controls = new MapControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;
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

  public start = ():void => {
    requestAnimationFrame(this.start);
    this.controls.update();
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
    const arr = this.scene.children.filter((x) => x);
    arr.forEach((mesh: THREE.Object3D) => {
      // console.log(mesh);
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
