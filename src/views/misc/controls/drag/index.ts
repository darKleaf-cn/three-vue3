import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private group!: THREE.Group;
  private objects: Array<THREE.Mesh> = [];
  private controls!: DragControls;
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  private enableSelection = false;
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
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      70,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      5000
    );
    this.camera.position.z = 1000;
  }

  private setLight(): void {
    this.scene.add(new THREE.AmbientLight(0x505050));

    const light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 500, 2000);
    light.angle = Math.PI / 9;

    light.castShadow = true;
    light.shadow.camera.near = 1000;
    light.shadow.camera.far = 4000;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    this.scene.add(light);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  private setMesh(): void {
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const geometry = new THREE.BoxGeometry(40, 40, 40);
    for (let i = 0; i < 200; i++) {
      const object = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
          color: Math.random() * 0xffffff
        })
      );

      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600 - 300;
      object.position.z = Math.random() * 800 - 400;

      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;

      object.scale.x = Math.random() * 2 + 1;
      object.scale.y = Math.random() * 2 + 1;
      object.scale.z = Math.random() * 2 + 1;

      object.castShadow = true;
      object.receiveShadow = true;

      this.scene.add(object);
      this.objects.push(object);
    }
  }

  private setControls(): void {
    this.controls = new DragControls([...this.objects], this.camera, this.renderer.domElement);
    this.controls.addEventListener('drag', this.render);
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

  private onClick(e: MouseEvent): void {
    e.preventDefault();
    if (this.enableSelection === true) {
      const draggableObjects = this.controls.getObjects();
      draggableObjects.length = 0;

      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX + this.offsetX + 20) / (window.innerWidth + this.offsetX)) * 2 - 1;
      mouse.y = -((e.clientY + this.offsetY + 20) / (window.innerHeight + this.offsetY)) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      const intersections = raycaster.intersectObjects(this.objects, true);

      if (intersections.length > 0) {
        const object = intersections[0].object as THREE.Mesh;
        if (this.group.children.includes(object) === true) {
          console.log(1);
          (object.material as THREE.MeshLambertMaterial).emissive.set(0x000000);
          this.scene.attach(object);
        } else {
          (object.material as THREE.MeshLambertMaterial).emissive.set(0xaaaaaa);
          this.group.attach(object);
        }
        this.controls.transformGroup = true;
        draggableObjects.push(this.group);
      }
      console.log(this.scene.children);
      if (this.group.children.length === 0) {
        this.controls.transformGroup = false;
        draggableObjects.push(...this.objects);
      }
    }
    this.render();
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.enableSelection = e.shiftKey;
  }

  private onKeyUp(): void {
    this.enableSelection = false;
  }

  public start(): void {
    this.render();
  }

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
export default Three;
