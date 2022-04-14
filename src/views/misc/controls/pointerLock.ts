import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

class Three {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: PointerLockControls;
  private raycaster: THREE.Raycaster;
  private objects: Array<THREE.Mesh> = [];
  private container: HTMLElement;
  private offsetX: number;
  private offsetY: number;
  private prevTime = performance.now();
  private velocity = new THREE.Vector3();
	private direction = new THREE.Vector3();
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private canJump = false;
  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    // 初始化变量
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    // 初始化场景
    this.setScene();
    this.setCamera();
    this.setLight();
    this.setControls();
    this.setRenderer();
    this.setMesh();
    // this.setControls();

    // 添加事件
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onClick = this.onClick.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('click', this.onClick);
  }

  private setScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0xffffff, 0, 750);
  }

  private setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      1000
    );
    this.camera.position.y = 10;
  }

  private setLight(): void {
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    this.scene.add(light);
  }

  private setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth + this.offsetX, window.innerHeight + this.offsetY);
    this.container.appendChild(this.renderer.domElement);
  }

  private setMesh(): void {
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    let position = floorGeometry.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i);

      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    const floorGeometry2 = floorGeometry.toNonIndexed();
    position = floorGeometry2.attributes.position;
    const colorsFloor = [];
    const color = new THREE.Color();

    for (let i = 0, l = position.count; i < l; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colorsFloor.push(color.r, color.g, color.b);
    }

    floorGeometry2.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));
    const floorMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true
    });
    const floor = new THREE.Mesh(floorGeometry2, floorMaterial);
    this.scene.add(floor);

    // objects
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();
    position = boxGeometry.attributes.position;
    const colorsBox = [];
    for (let i = 0, l = position.count; i < l; i++) {
      color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
      colorsBox.push(color.r, color.g, color.b);
    }
    boxGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBox, 3));

    for (let i = 0; i < 500; i++) {
      const boxMaterial = new THREE.MeshPhongMaterial({
        specular: 0xffffff,
        flatShading: true,
        vertexColors: true
      });
      boxMaterial.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
      box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
      box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

      this.scene.add(box);
      this.objects.push(box);
    }
  }

  private setControls(): void {
    this.controls = new PointerLockControls(this.camera, this.container);
    this.scene.add(this.controls.getObject());
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
    switch (e.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump === true) {
          this.velocity.y += 350;
        }
        this.canJump = false;
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

	private onClick():void {
		this.controls.lock();
	}

  public start = (): void => {
    requestAnimationFrame(this.start);
    const time = performance.now();
    if (this.controls.isLocked === true) {
      this.raycaster.ray.origin.copy(this.controls.getObject().position);
      this.raycaster.ray.origin.y -= 10;

      const intersections = this.raycaster.intersectObjects(this.objects, false);
      const onObject = intersections.length > 0;
      const delta = (time - this.prevTime) / 1000;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 100.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * 400.0 * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * 400.0 * delta;
      }
      if (onObject === true) {
        this.velocity.y = Math.max(0, this.velocity.y);
        this.canJump = true;
      }

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);
      this.controls.getObject().position.y += this.velocity.y * delta;

      if (this.controls.getObject().position.y < 10) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = 10;
        this.canJump = true;
      }
    }
    this.prevTime = time;
    this.render();
  };

  public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('click', this.onClick);
		this.renderer.dispose();
		this.renderer.forceContextLoss();

		this.container.removeChild(this.renderer.domElement);
  }
}
export default Three;
