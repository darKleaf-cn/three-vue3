<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import clearScene from '@/utils/clearScene';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const startTime = new Date().getTime();
    let frameId: number;

    let scene: THREE.Scene | null;
    let camera: THREE.PerspectiveCamera | null;
    let mesh: THREE.Mesh | null;
    let renderer: THREE.WebGLRenderer | null;
    let controls: OrbitControls | null;

    onMounted(() => {
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
      camera = new THREE.PerspectiveCamera(
        36,
        (window.innerWidth + offsetX) / (window.innerHeight + offsetY),
        0.25,
        16
      );
      camera.position.set(0, 1.3, 3);

      // 初始化灯光

      scene.add(new THREE.AmbientLight(0x505050));
      const spotLight = new THREE.SpotLight(0xffffff);
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.2;
      spotLight.position.set(2, 3, 3);
      spotLight.castShadow = true;
      spotLight.shadow.camera.near = 3;
      spotLight.shadow.camera.far = 10;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add(spotLight);

      // const dirLight = new THREE.DirectionalLight(0x55505a, 1);
      // dirLight.position.set(0, 3, 0);
      // dirLight.castShadow = true;
      // dirLight.shadow.camera.near = 1;
      // dirLight.shadow.camera.far = 10;
      // dirLight.shadow.camera.right = 1;
      // dirLight.shadow.camera.top = 1;
      // dirLight.shadow.camera.bottom = -1;
      // dirLight.shadow.mapSize.width = 1024;
      // dirLight.shadow.mapSize.height = 1024;
      // scene.add(dirLight);

      // 初始化网格
      const lcoalPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);
      // const globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.1);

      const material = new THREE.MeshPhongMaterial({
        color: 0x80ee10,
        shininess: 100,
        side: THREE.DoubleSide,
        clippingPlanes: [lcoalPlane],
        clipShadows: true
      });
      const geometry = new THREE.TorusKnotGeometry(0.4, 0.08, 95, 20);
      mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      scene.add(mesh);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 9, 1, 1),
        new THREE.MeshPhongMaterial({
          color: 0xa0adaf,
          shininess: 150
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // 初始化渲染器
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      renderer.shadowMap.enabled = true;
      (container.value as HTMLElement).appendChild(renderer.domElement);
      renderer.localClippingEnabled = true;

      window.addEventListener('resize', onWindowResize);

      // 初始化控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.update();
    }
    function onWindowResize() {
      if (renderer && camera) {
        renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
        camera.aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
        camera.updateProjectionMatrix();
      }
    }
    function animate() {
      render();
      frameId = requestAnimationFrame(animate);
    }
    function render() {
      if (renderer && scene && camera && mesh) {
        const currentTime = new Date().getTime();
        const time = (currentTime - startTime) / 1000;
        mesh.position.y = 0.8;
        mesh.rotation.x = time * 0.5;
        mesh.rotation.y = time * 0.2;
        mesh.scale.setScalar(Math.cos(time) * 0.125 + 0.875);
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
