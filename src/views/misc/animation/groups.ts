import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
class Three {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | null = null;
  renderer!: THREE.WebGLRenderer;
  mixer: THREE.AnimationMixer | null = null;
  stats!: Stats;
  clock: THREE.Clock;
  container: HTMLElement;
  offsetX: number;
  offsetY: number;
  frameId!: number;

  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.init();
  }

  init(): void {
    this.setCamera();
    this.setMixer();
    this.setRenderer();
    this.setStats();

    // 添加事件
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      40,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      1000
    );
    this.camera.position.set(50, 50, 100);
    this.camera.lookAt(this.scene.position);
  }

  setMixer(): void {
    const animationGroup = new THREE.AnimationObjectGroup();
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshBasicMaterial({ transparent: true });

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = 32 - 16 * i;
        mesh.position.y = 0;
        mesh.position.z = 32 - 16 * j;

        this.scene.add(mesh);
        animationGroup.add(mesh);
      }
    }

    const xAxis = new THREE.Vector3(1, 0, 0);
    const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
    const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
    const quaternionKF = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      [0, 1, 2],
      [
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w,
        qFinal.x,
        qFinal.y,
        qFinal.z,
        qFinal.w,
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w
      ]
    );
    const colorKF = new THREE.ColorKeyframeTrack(
      '.material.color',
      [0, 1, 2],
      [1, 0, 0, 0, 1, 0, 0, 0, 1],
      THREE.InterpolateDiscrete
    );
    const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1]);
    const clip = new THREE.AnimationClip('default', 3, [quaternionKF, colorKF, opacityKF]);
    this.mixer = new THREE.AnimationMixer(animationGroup);
    const clipAction = this.mixer.clipAction(clip);
    clipAction.play();
  }

  setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.container.appendChild(this.renderer.domElement);
  }

  setStats(): void {
    this.stats = Stats();
    this.stats.domElement.style.left = 'auto';
    this.stats.domElement.style.right = '20px';
    this.stats.domElement.style.top = '20px';
    this.container.appendChild(this.stats.dom);
  }

  start = (): void => {
    this.frameId = requestAnimationFrame(this.start);
    this.render();
  };

  render(): void {
    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }
    if (this.renderer && this.camera && this.stats) {
      this.renderer.render(this.scene, this.camera);
      this.stats.update();
    }
  }

  onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    }
  }

  public end(): void {
    // if (this.renderer) {
    //   window.removeEventListener('resize', this.onWindowResize);
    //   this.renderer.dispose();
    //   this.renderer.forceContextLoss();
    //   this.stats.end();
    //   this.container.removeChild(this.stats.domElement);
    //   this.container.removeChild(this.renderer.domElement);
    // 	this.renderer = null;
    // }
    // function disposeChild(mesh: THREE.Object3D) {
    //   if (mesh instanceof THREE.Mesh) {
		// 		console.log(mesh)
    //     if (mesh.geometry?.dispose) {
    //       mesh.geometry.dispose();
    //     }
    //     if (mesh.material?.dispose) {
    //       mesh.material.dispose();
    //     }
    //     if (mesh.material?.texture?.dispose) {
    //       mesh.material.texture.dispose();
    //     }
    //   }
    //   if (mesh instanceof THREE.Group) {
    //     mesh.clear();
    //   }
    //   if (mesh instanceof THREE.Object3D) {
    //     mesh.clear();
    //   }
    // }
    cancelAnimationFrame(this.frameId);

    // this.scene.traverse((item) => {
    //   disposeChild(item);
    // });
    THREE.Cache.clear();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
		this.stats.end();
		this.container.removeChild(this.stats.domElement);
		this.container.removeChild(this.renderer.domElement);
  }
}
export default Three;