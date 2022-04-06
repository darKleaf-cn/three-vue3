import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter';
// import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
// import { GUI } from 'lil-gui';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
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

    window.addEventListener('resize', this.onWindowResize);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaaaaaa);
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      20000
    );
    this.camera.position.set(-150, 137.5, 325);
  }

  private setLight(): void {
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(light);
    this.scene.add(ambientLight);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
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
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', this.render);
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

// function setupGui(): void {
//   const effectControler = {
//     shininess: 40.0,
//     ka: 0.17,
//     kd: 0.51,
//     ks: 0.2,
//     metallic: true,

//     hue: 0.121,
//     saturation: 0.73,
//     lightness: 0.66,

//     lhue: 0.04,
//     lsaturation: 0.01,
//     llightness: 1.0,
//     vertexColors: false,

//     lx: 0.32,
//     ly: 0.39,
//     lz: 0.7,
//     newTess: 15,
//     bottom: true,
//     lid: true,
//     body: true,
//     fitLid: false,
//     nonblinn: false,
//     newShading: 'glossy',
//     export: exportCollada
//   };
//   let h: GUI;
//   const gui = new GUI();

//   // material

//   h = gui.addFolder('Material control');
//   h.add(effectControler, 'shiininess', 1.0, 400.0, 1.0).name('shininess').onChange(render);
// 	h.add(effectControler, 'kd', 0.0, 1.0, 0.025).name('diffuse strength').onChange(render);
// 	h.add(effectControler, 'ks', 0.0, 1.0, 0.025).name('specular strength').onChange(render);

// 	h = gui.addFolder('Material color');
// 	h.add(effectControler, 'hue', 0.0, 1.0, 0.025).name('hue').onChange(render);
// 	h.add(effectControler, 'saturation', 0.0, 1.0, 0.025).name('saturation').onChange(render);
// 	h.add(effectControler, 'lightness', 0.0, 1.0, 0.025).name('lightness').onChange(render);
// 	h.add(effectControler, 'vertexColors').onChange(render);

// 	h = gui.addFolder('Tessellation control');
// 	h.add(effectControler, 'newTess', [2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50]).name('Tessellation Level').onChange(render);
// 	h.add(effectControler, 'lib').name('display lid').onChange(render);
// 	h.add(effectControler, 'body').name('display body').onChange(render);
// 	h.add(effectControler, 'bottom').name('display bottom').onChange(render);
// 	h

//   function exportCollada(): void {}
//   function render(): void {}
// }
export default Three;
