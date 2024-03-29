import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private mixers: Array<THREE.AnimationMixer> = [];
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
    this.setLight();
    this.setMesh();
    this.setLoader();

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
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xfffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add(dirLight);
  }

  private setMesh(): void {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  private setLoader(): void {
    const loader = new GLTFLoader();
    loader.load('./static/models/gltf/Soldier.glb', (gltf) => {
      gltf.scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
        }
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const model1 = SkeletonUtils.clone(gltf.scene);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const model2 = SkeletonUtils.clone(gltf.scene);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const model3 = SkeletonUtils.clone(gltf.scene);

      const mixer1 = new THREE.AnimationMixer(model1);
      const mixer2 = new THREE.AnimationMixer(model2);
      const mixer3 = new THREE.AnimationMixer(model3);

      mixer1.clipAction(gltf.animations[0]).play();
      mixer2.clipAction(gltf.animations[1]).play();
      mixer3.clipAction(gltf.animations[2]).play();

      model1.position.x = -2;
      model2.position.x = 0;
      model3.position.x = 2;

      this.scene.add(model1, model2, model3);
      this.mixers.push(mixer1, mixer2, mixer3);

      this.start();
    });
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }

  private render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    this.camera.aspect = (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
  }

  public start = (): void => {
    requestAnimationFrame(this.start);
    const delta = this.clock.getDelta();
    for (const mixer of this.mixers) {
      mixer.update(delta);
    }
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
    const arr = this.scene.children.filter((x) => x);
    arr.forEach((mesh: THREE.Object3D) => {
      if (mesh instanceof THREE.Mesh) {
        if (mesh.geometry) {
          mesh.geometry.dispose();
          mesh.geometry.clearGroups();
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
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.container.removeChild(this.renderer.domElement);
  }
}
export default Three;
