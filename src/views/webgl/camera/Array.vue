<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import clearScene from '@/utils/clearScene';

interface SubPerspectiveCamera extends THREE.PerspectiveCamera {
  viewport?: THREE.Vector4;
}

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
    const amount = 6;
    const width = (window.innerWidth / amount) * window.devicePixelRatio;
    const height = (window.innerHeight / amount) * window.devicePixelRatio;
    let frameId: number;

    let scene: THREE.Scene | null;
    let camera: THREE.ArrayCamera | null;
    let mesh: THREE.Mesh | null;
    let renderer: THREE.WebGLRenderer | null;

    onMounted(() => {
      console.log(1);
      init();
      animate();
    });

    onBeforeUnmount(() => {
      destory();
    });

    function init() {
      // 初始化场景
      scene = new THREE.Scene();

      // 初始化相机
      const cameras: Array<SubPerspectiveCamera> = [];
      for (let y = 0; y < amount; y++) {
        for (let x = 0; x < amount; x++) {
          const subcamera: SubPerspectiveCamera = new THREE.PerspectiveCamera(40, aspect, 0.1, 10);
          subcamera.viewport = new THREE.Vector4(
            Math.floor(x * width),
            Math.floor(y * height),
            Math.ceil(width),
            Math.ceil(height)
          );
          subcamera.position.x = x / amount - 0.5;
          subcamera.position.y = 0.5 - y / amount;
          subcamera.position.z = 1.5;
          subcamera.position.multiplyScalar(2);
          subcamera.lookAt(0, 0, 0);
          subcamera.updateMatrixWorld();
          cameras.push(subcamera);
        }
      }

      camera = new THREE.ArrayCamera(cameras);
      camera.position.z = 3;

      // 初始化灯光

      scene.add(new THREE.AmbientLight(0x222244));
      const light = new THREE.DirectionalLight();
      light.position.set(0.5, 0.5, 1);
      light.castShadow = true;
      light.shadow.camera.zoom = 4;
      scene.add(light);

      // 初始化网格
      const geometryBackground = new THREE.PlaneGeometry(100, 100);
      const materialBackground = new THREE.MeshPhongMaterial({ color: 0x0000066 });
      const background = new THREE.Mesh(geometryBackground, materialBackground);
      background.receiveShadow = true;
      background.position.set(0, 0, -1);
      scene.add(background);

      const geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });

      mesh = new THREE.Mesh(geometryCylinder, materialCylinder);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      renderer.shadowMap.enabled = true;
      (container.value as HTMLElement).appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);
    }
    function onWindowResize() {
      if (renderer && camera) {
        renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
        camera.aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
        camera.updateProjectionMatrix();

        const ASPECT_RATIO = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
        const WIDTH = ((window.innerWidth + offsetX) / amount) * window.devicePixelRatio;
        const HEIGHT = ((window.innerHeight + offsetY) / amount) * window.devicePixelRatio;

        for (let y = 0; y < amount; y++) {
          for (let x = 0; x < amount; x++) {
            const subcamera: SubPerspectiveCamera = camera.cameras[amount * y + x];
            (subcamera.viewport as THREE.Vector4).set(
              Math.floor(x * WIDTH),
              Math.floor(y * HEIGHT),
              Math.ceil(WIDTH),
              Math.ceil(HEIGHT)
            );
            subcamera.aspect = ASPECT_RATIO;
            subcamera.updateProjectionMatrix();
          }
        }
      }
    }
    function animate() {
      if (mesh) {
        mesh.rotation.x += 0.005;
        mesh.rotation.z += 0.01;
      }
      render();
      frameId = requestAnimationFrame(animate);
    }
    function render() {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
    function destory() {
      if (scene && mesh && renderer) {
        window.removeEventListener('resize', onWindowResize);
        clearScene(scene);
        renderer.dispose();
        renderer.forceContextLoss();
        cancelAnimationFrame(frameId);

        mesh = null;
        scene = null;
        camera = null;
        renderer = null;
        THREE.Cache.clear();
      }
    }
    return {
      container
    };
  }
});
</script>

<style></style>
