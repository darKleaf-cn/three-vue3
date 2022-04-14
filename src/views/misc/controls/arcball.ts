import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
interface ArcballGui {
  gizmoVisible: boolean;
  setArcballControls: () => void;
  populateGui: () => void;
}

class Three {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  private perspectiveDistance = 2.5;
  private arcballGui: ArcballGui | null = null;
  private folderOptions: GUI | null = null;
  private folderAnimations: GUI | null = null;
  private gui!: GUI;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
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
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
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

  private setModel(): void {
    const material = new THREE.MeshStandardMaterial();
    const that = this;
    new OBJLoader().setPath('./static/models/obj/cerberus/').load('Cerberus.obj', function (group) {
      const textureLoader = new THREE.TextureLoader().setPath('./static/models/obj/cerberus/');
      material.roughness = 1;
      material.metalness = 1;

      const diffuseMap = textureLoader.load('Cerberus_A.jpg', that.render);
      diffuseMap.encoding = THREE.sRGBEncoding;
      material.map = diffuseMap;

      material.metalnessMap = material.roughnessMap = textureLoader.load('Cerberus_RM.jpg', that.render);
      material.normalMap = textureLoader.load('Cerberus_N.jpg', that.render);
      material.map.wrapS = THREE.RepeatWrapping;
      material.roughnessMap.wrapS = THREE.RepeatWrapping;
      material.normalMap.wrapS = THREE.RepeatWrapping;

      group.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = material;
        }
      });

      group.rotation.y = Math.PI / 2;
      group.position.x += 0.25;
      that.scene.add(group);

      new RGBELoader()
        .setPath('./static/textures/equirectangular/')
        .load('venice_sunset_1k.hdr', function (hdrEquiret) {
          hdrEquiret.mapping = THREE.EquirectangularReflectionMapping;
          that.scene.environment = hdrEquiret;
          that.render();
        });

      that.gui = new GUI();
      that.folderOptions = that.gui.addFolder('Arcball parameters');
      that.folderAnimations = that.folderOptions.addFolder('animations');

      if (that.arcballGui) {
        that.arcballGui.setArcballControls();
      }
      that.render();
    });
  }

  private setGui(): void {
    let controls: ArcballControls;
    const { camera, renderer, scene, render } = this;
    const that = this;
    if (camera && renderer) {
      const arcballGui = {
        gizmoVisible: true,
        setArcballControls: function () {
          controls = new ArcballControls(camera, renderer.domElement, scene);
          controls.addEventListener('change', render);
          this.gizmoVisible = true;
          this.populateGui();
        },
        populateGui: function () {
          if (that.folderOptions && that.folderAnimations) {
            that.folderOptions.add(controls, 'enabled').name('Enable controls');
            that.folderOptions.add(controls, 'enableGrid').name('Enable Grid');
            that.folderOptions.add(controls, 'enableRotate').name('Enable rotate');
            that.folderOptions.add(controls, 'enablePan').name('Enable pan');
            that.folderOptions.add(controls, 'enableZoom').name('Enable zoom');
            that.folderOptions.add(controls, 'cursorZoom').name('Cursor zoom');
            that.folderOptions.add(controls, 'adjustNearFar').name('adjust near/far');
            that.folderOptions.add(controls, 'scaleFactor', 1.1, 10, 0.1).name('Scale factor');
            that.folderOptions.add(controls, 'minDistance', 0, 50, 0.5).name('Min distance');
            that.folderOptions.add(controls, 'maxDistance', 0, 50, 0.5).name('Max distance');
            that.folderOptions.add(controls, 'minZoom', 0, 50, 0.5).name('Min zoom');
            that.folderOptions.add(controls, 'maxZoom', 0, 50, 0.5).name('Max zoom');
            that.folderOptions
              .add(arcballGui, 'gizmoVisible')
              .name('Show gizmos')
              .onChange(function () {
                controls.setGizmosVisible(arcballGui.gizmoVisible);
              });
            that.folderOptions.add(controls, 'copyState').name('Copy state(ctrl+c)');
            that.folderOptions.add(controls, 'pasteState').name('Paste state(ctrl+v)');
            that.folderOptions.add(controls, 'reset').name('Reset');
            that.folderAnimations.add(controls, 'enableAnimations').name('Enable anim.');
            that.folderAnimations.add(controls, 'dampingFactor', 0, 100, 1).name('Damping');
            that.folderAnimations.add(controls, 'wMax', 0, 100, 1).name('Angular spd');
          }
        }
      };
      this.arcballGui = arcballGui;
    }
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

  public start(): void {
    this.render();
  }

  private render = () => {
    if (this.renderer && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

	public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
		this.renderer.dispose();
		this.renderer.forceContextLoss();
		this.gui.destroy();
		this.container.removeChild(this.renderer.domElement);
  }

  private onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    }
  }
}
export default Three;
