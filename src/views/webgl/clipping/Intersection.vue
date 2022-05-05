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

    let scene: THREE.Scene | null;
    let camera: THREE.PerspectiveCamera | null;
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
        40,
        (window.innerWidth + offsetX) / (window.innerHeight + offsetY),
        1,
        200
      );
      camera.position.set(-1.5, 2.5, 3.0);

      // 初始化灯光
      const light = new THREE.HemisphereLight(0xffffff, 0x080808, 1.5);
			light.position.set(-1.25, 1, 1.25);
			scene.add(light);

      // 初始化网格
      const clipPlanes = [
				new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
				new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
				new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
			]

			const group = new THREE.Group();
			for (let i = 1; i <= 30; i += 2) {
				const geometry = new THREE.SphereGeometry(i / 30, 48, 24);
				const material = new THREE.MeshLambertMaterial({
					color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
					side: THREE.DoubleSide,
					clippingPlanes: clipPlanes,
					clipIntersection: false
				});
				group.add(new THREE.Mesh(geometry, material));
			}
			scene.add(group);

			// 初始化辅助对象
			const helpers = new THREE.Group();
			helpers.add(new THREE.PlaneHelper(clipPlanes[0], 2, 0xff0000));
			helpers.add(new THREE.PlaneHelper(clipPlanes[1], 2, 0x00ff00));
			helpers.add(new THREE.PlaneHelper(clipPlanes[2], 2, 0x0000ff));
			helpers.visible = true;
			scene.add(helpers);

      // 初始化渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
       renderer.localClippingEnabled = true;
      (container.value as HTMLElement).appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);

      // 初始化控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener('change', render);
			controls.minDistance = 1;
			controls.maxDistance = 10;
			controls.enablePan = false;
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
    }
    function render() {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
    function destory() {
      if (scene && renderer) {
        window.removeEventListener('resize', onWindowResize);
        clearScene(scene);
        renderer.dispose();
        renderer.forceContextLoss();

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
