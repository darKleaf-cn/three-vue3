import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
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

  constructor(container: HTMLElement, offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.container = container;
    this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xf0f0f0);
    this.clock = new THREE.Clock();
    this.init();
  }

  init(): void {
    this.setCamera();
    this.setLight();
		this.setMesh();
    this.setRenderer();
    this.setStats();
		this.setSelection();
		
		this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  setCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      70,
      (window.innerWidth + this.offsetX) / (window.innerHeight + this.offsetY),
      1,
      5000
    );
		this.camera.position.z = 1000;
    // this.camera.position.set(25, 25, 50);
    // this.camera.lookAt(this.scene.position);
  }

	setLight(): void {
		this.scene.add(new THREE.AmbientLight(0x505050));
		const light = new THREE.SpotLight(0xffffff, 1.5);
		light.position.set(0, 500, 2000);
		light.angle = Math.PI / 9;

		light.castShadow = true;
		light.shadow.camera.near = 100;
		light.shadow.camera.far = 4000;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		this.scene.add(light);
	}

	setMesh(): void {
		const geometry = new THREE.BoxGeometry(20, 20, 20);
		for (let i = 0; i < 200; i++) {
			const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
				color: Math.random() * 0xffffff
			}));

			object.position.x = Math.random() * 1600 - 800;
			object.position.y = Math.random() * 900 - 450;
			object.position.z = Math.random() * 900 - 450;

			object.rotation.x = Math.random() * 2 * Math.PI;
			object.rotation.y = Math.random() * 2 * Math.PI;
			object.rotation.z = Math.random() * 2 * Math.PI;

			object.scale.x = Math.random() * 2 + 1;
			object.scale.y = Math.random() * 2 + 1;
			object.scale.z = Math.random() * 2 + 1;

			object.castShadow = true;
			object.receiveShadow = true;

			this.scene.add(object);
		}
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

  setSelection(): void {
    if (this.camera && this.renderer) {
      const selectionBox = new SelectionBox(this.camera, this.scene);
			const helper = new SelectionHelper(selectionBox, this.renderer, 'selectBox');

			document.addEventListener('pointerdown', function (event) {
				for (const item of selectionBox.collection) {
					(item.material as THREE.MeshLambertMaterial).emissive.set(0x000000);
				}
				selectionBox.startPoint.set(((event.clientX - 200) / (window.innerWidth - 200)) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
			});
			document.addEventListener('pointermove', function (event) {
				if (helper.isDown) {
					for (let i = 0; i < selectionBox.collection.length; i++) {
						(selectionBox.collection[i].material as THREE.MeshLambertMaterial).emissive.set(0x000000);
					}
					selectionBox.endPoint.set(((event.clientX - 200) / (window.innerWidth - 200)) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
	
					const allSelected = selectionBox.select();
					for (let i = 0; i < allSelected.length; i++) {
						(allSelected[i].material as THREE.MeshLambertMaterial).emissive.set(0xffffff);
					}
				}
			});
			document.addEventListener('pointerup', function (event) {
				selectionBox.endPoint.set(((event.clientX - 200) / (window.innerWidth - 200)) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
				const allSelected = selectionBox.select();
				for (let i = 0; i < allSelected.length; i++) {
					(allSelected[i].material as THREE.MeshLambertMaterial).emissive.set(0xffffff);
				}
			});
    }
  }

  start(): void {
    requestAnimationFrame(this.start.bind(this));
    this.render();
  }

	public end(): void {
    window.removeEventListener('resize', this.onWindowResize);
		this.renderer.dispose();
		this.renderer.forceContextLoss();
		this.stats.end();
		this.container.removeChild(this.stats.domElement);
		this.container.removeChild(this.renderer.domElement);
  }

  render(): void {
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
