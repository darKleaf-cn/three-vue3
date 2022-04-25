<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const aspect = (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
    const frustumSize = 600;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let cameraPerspective: THREE.PerspectiveCamera;
    let cameraPerspectiveHelper: THREE.CameraHelper;
    let cameraOrtho: THREE.OrthographicCamera;
    let cameraOrthoHelper: THREE.CameraHelper;
    let activeCamera: THREE.Camera;
    let activeHelper: THREE.CameraHelper;
    let cameraRig: THREE.Group;
    let mesh: THREE.Mesh;
    let renderer: THREE.WebGLRenderer;
    let stats: Stats;

    onMounted(() => {
      init();
			animate();
    });
    function init() {
      // 初始化场景
      scene = new THREE.Scene();

      // 初始化相机
      camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 10000);
      camera.position.z = 2500;

      // 透视投影相机
      cameraPerspective = new THREE.PerspectiveCamera(50, 0.5 * aspect, 150, 1000);
      cameraPerspectiveHelper = new THREE.CameraHelper(cameraPerspective);
      scene.add(cameraPerspectiveHelper);

      // 正投影相机
      cameraOrtho = new THREE.OrthographicCamera(
        (0.5 * frustumSize * aspect) / -2,
        (0.5 * frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        150,
        1000
      );
      cameraOrthoHelper = new THREE.CameraHelper(cameraOrtho);
      scene.add(cameraOrthoHelper);

      activeCamera = cameraPerspective;
      activeHelper = cameraPerspectiveHelper;

      cameraOrtho.rotation.y = Math.PI;
      cameraPerspective.rotation.y = Math.PI;
      cameraRig = new THREE.Group();
      cameraRig.add(cameraOrtho);
      cameraRig.add(cameraPerspective);
			scene.add(cameraRig);

      // 网格
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(100, 16, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true
        })
      );
      scene.add(mesh);

      const mesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(50, 16, 8),
        new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true
        })
      );
      mesh2.position.y = 150;
      mesh.add(mesh2);

      const mesh3 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 16, 8),
        new THREE.MeshBasicMaterial({
          color: 0x0000ff,
          wireframe: true
        })
      );
      mesh3.position.z = 150;
      cameraRig.add(mesh3);

      //
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let i = 0; i < 10000; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(2000));
        vertices.push(THREE.MathUtils.randFloatSpread(2000));
        vertices.push(THREE.MathUtils.randFloatSpread(2000));
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888 }));
      scene.add(particles);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      (container.value as HTMLElement).appendChild(renderer.domElement);
      renderer.autoClear = false;

      stats = Stats();
      (container.value as HTMLElement).appendChild(stats.dom);

      window.addEventListener('resize', onWindowResize);
      document.addEventListener('keydown', onKeyDown);
    }
    function onWindowResize() {
      renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
      camera.aspect = 0.5 * (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
      camera.updateProjectionMatrix();

      cameraPerspective.aspect = 0.5 * (window.innerWidth + offsetX) / (window.innerHeight + offsetY);
      cameraPerspective.updateProjectionMatrix();

      cameraOrtho.left = (-0.5 * frustumSize * (window.innerWidth + offsetX) / (window.innerHeight + offsetY)) / 2;
      cameraOrtho.right = (0.5 * frustumSize * (window.innerWidth + offsetX) / (window.innerHeight + offsetY)) / 2;
      cameraOrtho.top = frustumSize / 2;
      cameraOrtho.bottom = -frustumSize / 2;
      cameraOrtho.updateProjectionMatrix();
    }
    function onKeyDown(e: KeyboardEvent) {
      switch (e.keyCode) {
        case 79:
          activeCamera = cameraOrtho;
          activeHelper = cameraOrthoHelper;
          break;
        case 80:
          activeCamera = cameraPerspective;
          activeHelper = cameraPerspectiveHelper;
          break;
      }
    }
		function animate() {
			requestAnimationFrame(animate);
			render();
			stats.update();
		}
		function render() {
			const r = Date.now() * 0.0005;
			
			mesh.position.x = 700 * Math.cos(r);
			mesh.position.y = 700 * Math.sin(r);
			mesh.position.z = 700 * Math.sin(r);

			mesh.children[0].position.x = 70 * Math.cos(2 * r);
			mesh.children[0].position.z = 70 * Math.sin(r);
			if (activeCamera === cameraPerspective) {
				cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
				cameraPerspective.far = mesh.position.length();
				cameraPerspective.updateProjectionMatrix();

				cameraPerspectiveHelper.update();
				cameraPerspectiveHelper.visible = true;
				
				cameraOrthoHelper.visible = false;
			} else {
				cameraOrtho.far = mesh.position.length();
				cameraOrtho.updateProjectionMatrix();

				cameraOrthoHelper.update();
				cameraOrtho.visible = true;

				cameraPerspectiveHelper.visible = false;
			}
			cameraRig.lookAt(mesh.position);
			renderer.clear();
			activeHelper.visible = false;
			renderer.setViewport(0, 0, (window.innerWidth + offsetX) / 2, (window.innerHeight + offsetY));
			renderer.render(scene, activeCamera);

			activeHelper.visible = true;
			renderer.setViewport((window.innerWidth + offsetX) / 2, 0, (window.innerWidth + offsetX) / 2, (window.innerHeight + offsetY));
			renderer.render(scene, camera);
		}
    return {
      container
    };
  }
});
</script>

<style></style>
