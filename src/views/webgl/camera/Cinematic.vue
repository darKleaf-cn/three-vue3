<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera';
import clearScene from '@/utils/clearScene';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
    const mouse = new THREE.Vector2();
    let theta = 0;
    let frameId: number;
    let currentHex: number;

    let scene: THREE.Scene | null;
    let camera: CinematicCamera | null;
    let mesh: THREE.Mesh | null;
    let renderer: THREE.WebGLRenderer | null;
    let raycaster: THREE.Raycaster | null;
    let intersected: THREE.Mesh | null;

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
      scene.background = new THREE.Color(0xf0f0f0);

      // 初始化相机
      camera = new CinematicCamera(60, aspect, 1, 1000);
      camera.setLens(5);
      camera.position.set(2, 1, 500);

      // 初始化灯光

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const light = new THREE.DirectionalLight(0xffffff, 0.35);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);

      // 初始化网格
      const geometry = new THREE.BoxGeometry(20, 20, 20);
      for (let i = 0; i < 1500; i++) {
        const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
        object.position.x = Math.random() * 800 - 400;
        object.position.y = Math.random() * 800 - 400;
        object.position.z = Math.random() * 800 - 400;
        scene.add(object);
      }

      raycaster = new THREE.Raycaster();

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      (container.value as HTMLElement).appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);
      document.addEventListener('mousemove', onMouseMove);
    }
    function onWindowResize() {
      if (renderer && camera) {
        camera.aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      }
    }
    function onMouseMove(e: MouseEvent) {
      e.preventDefault();
      mouse.x = ((e.clientX + offsetX) / (window.innerWidth + offsetX)) * 2 - 1;
      mouse.y = -((e.clientY + offsetY) / (window.innerHeight + offsetY)) * 2 + 1;
    }
    function animate() {
      frameId = requestAnimationFrame(animate);
      render();
    }
    function render() {
      if (renderer && scene && camera && raycaster) {
        theta += 0.1;
        camera.position.x = 100 * Math.sin(THREE.MathUtils.degToRad(theta));
        camera.position.y = 100 * Math.sin(THREE.MathUtils.degToRad(theta));
        camera.position.z = 100 * Math.cos(THREE.MathUtils.degToRad(theta));
        camera.lookAt(scene.position);
        camera.setLens(15, 20, 22, camera.coc);
        camera.updateMatrixWorld();

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);
        if (intersects.length > 0) {
          const targetDistance = intersects[0].distance;
          camera.focusAt(targetDistance);
          if (intersected !== intersects[0].object) {
            if (intersected) {
              (intersected.material as THREE.MeshLambertMaterial).emissive.setHex(currentHex);
            }
            intersected = intersects[0].object as THREE.Mesh;
            currentHex = (intersected.material as THREE.MeshLambertMaterial).emissive.getHex();
            (intersected.material as THREE.MeshLambertMaterial).emissive.setHex(0xff0000);
          }
        } else {
          if (intersected) {
            (intersected.material as THREE.MeshLambertMaterial).emissive.setHex(currentHex);
          }
          intersected = null;
        }

        if (camera.postprocessing.enabled) {
          camera.renderCinematic(scene, renderer);
        } else {
          scene.overrideMaterial = null;
          renderer.clear();
          renderer.render(scene, camera);
        }
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
        raycaster = null;
        intersected = null;
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
