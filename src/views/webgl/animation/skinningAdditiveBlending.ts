import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import GUI from 'lil-gui';

interface Actions {
  [index: string]: {
    weight: number;
    action?: THREE.AnimationAction;
  };
}

// interface Settings {
//   [index: string]: number | (() => void);
// }
const baseActions: Actions = {
  idle: { weight: 1 },
  walk: { weight: 0 },
  run: { weight: 0 }
};

const additiveActions: Actions = {
  sneak_pose: { weight: 0 },
  sad_pose: { weight: 0 },
  agree: { weight: 0 },
  headShake: { weight: 0 }
};

function activateAction(action: THREE.AnimationAction): void {
  const clip = action.getClip();
  const settings = baseActions[clip.name] || additiveActions[clip.name];
  setWeight(action, settings.weight);
  action.play();
}

function setWeight(action: THREE.AnimationAction, weight: number): void {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

// const currentBaseAction = 'idle';

function createPanel(): void {
  // const panel = new GUI({
  //   width: 310
  // });

  // // const folder1 = panel.addFolder('Base Actions');
  // // const folder2 = panel.addFolder('Additive Action Weights');
  // // const folder3 = panel.addFolder('General Speed');

  // const panelSetting: Settings = {
  //   'modify time scale': 1.0
  // };
  // const baseNames = ['None', ...Object.keys(baseActions)];

  // for (let i = 0, l = baseNames.length; i !== l; i++) {
  //   const name = baseNames[i];
  //   const settings = baseActions[name];
  //   panelSetting[name] = function () {
  //     const currentSettings = baseActions[currentBaseAction];
  //     const currentAction = currentSettings ? currentSettings.action : null;
  //     const action = settings ? settings.action : null;
  //   };
  // }
}

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private mixer!: THREE.AnimationMixer;
  private allActions: Array<THREE.AnimationAction> = [];
  private container: HTMLElement;
  private numAnimations = 0;
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
      100
    );
    this.camera.position.set(-1, 2, 3);
  }

  private setLight(): void {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffffff);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add(dirLight);
  }

  private setMesh(): void {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
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
    loader.load('./static/models/gltf/Xbot.glb', (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);

      model.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
        }
      });

      const skeleton = new THREE.SkeletonHelper(model);
      skeleton.visible = false;
      this.scene.add(skeleton);

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer(model);
      this.numAnimations = animations.length;

      for (let i = 0; i < this.numAnimations; i++) {
        let clip = animations[i];
        const name = clip.name;
        if (baseActions[name]) {
          const action = this.mixer.clipAction(clip);
          activateAction(action);
          baseActions[name].action = action;
        } else if (additiveActions[name]) {
          THREE.AnimationUtils.makeClipAdditive(clip);
          if (clip.name.endsWith('_pose')) {
            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
          }

          const action = this.mixer.clipAction(clip);
          activateAction(action);
          additiveActions[name].action = action;
          this.allActions.push(action);
        }
      }
      createPanel();

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
    for (let i = 0; i !== this.numAnimations; i++) {
      const action = this.allActions[i];
      const clip = action.getClip();
      const settings = baseActions[clip.name] || additiveActions[clip.name];
      settings.weight = action.getEffectiveWeight();
    }
    const delta = this.clock.getDelta();
    this.mixer.update(delta);
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
