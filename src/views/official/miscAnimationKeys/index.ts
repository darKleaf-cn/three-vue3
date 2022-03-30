import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
class Three {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  mixer: THREE.AnimationMixer | null = null;
  stats: Stats | null = null;
  clock: THREE.Clock;
  container: HTMLElement;
  offsetX: number;
  offsetY: number;

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
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      40,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      1000
    );
    this.camera.position.set(25, 25, 50);
    this.camera.lookAt(this.scene.position);
  }

  setMixer(): void {
    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper);
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    const positionKF = new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [0, 0, 0, 30, 0, 0, 0, 0, 0]);

    const scaleKF = new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [1, 1, 1, 2, 2, 2, 1, 1, 1]);

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

    const clip = new THREE.AnimationClip('default', 3, [scaleKF, positionKF, quaternionKF, colorKF, opacityKF]);

    this.mixer = new THREE.AnimationMixer(mesh);

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

  animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

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
}
export default Three;
