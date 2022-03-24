<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

export default defineComponent({
  name: 'Home',
  setup() {
    const container = ref<HTMLElement | null>(null);
    const scene = new THREE.Scene();
    const stats = Stats();
    let width = window.innerWidth - 240;
    let height = window.innerHeight - 40;
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const clock = new THREE.Clock();
    const animationGroup = new THREE.AnimationObjectGroup();
    let mixer: THREE.AnimationMixer;

    const init = function () {
      // camera
      camera.position.set(50, 50, 100);
      camera.lookAt(scene.position);

      const geometry = new THREE.BoxGeometry(5, 5, 5);
      const material = new THREE.MeshBasicMaterial({ transparent: true });

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const mesh = new THREE.Mesh(geometry, material);

          mesh.position.x = 32 - 16 * i;
          mesh.position.y = 0;
          mesh.position.z = 32 - 16 * j;

          scene.add(mesh);
          animationGroup.add(mesh);
        }
      }
      const xAxis = new THREE.Vector3(1, 0, 0);
      const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
      const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
      const quaternionKF = new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1, 2],
        [
          qInitial.x,
          qInitial.y,
          qInitial.z,
          qInitial.w,
          qFinal.x,
          qFinal.y,
          qFinal.z,
          qFinal.w,
          qInitial.x,
          qInitial.y,
          qInitial.z,
          qInitial.w
        ]
      );

      const colorKF = new THREE.ColorKeyframeTrack(
        '.material.color',
        [0, 1, 2],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        THREE.InterpolateDiscrete
      );
      const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1]);

      const clip = new THREE.AnimationClip('default', 3, [quaternionKF, colorKF, opacityKF]);

      mixer = new THREE.AnimationMixer(animationGroup);
      const clipAction = mixer.clipAction(clip);
      clipAction.play();

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      (container.value as HTMLElement).appendChild(renderer.domElement);
      (container.value as HTMLElement).appendChild(stats.dom);
      stats.domElement.style.top = '20px';
      stats.domElement.style.right = '20px';
      stats.domElement.style.left = 'auto';

      window.addEventListener('resize', onWindowResize);
    };
    const animate = function () {
      requestAnimationFrame(animate);
      render();
    };
    function onWindowResize() {
      width = window.innerWidth - 240;
      height = window.innerHeight - 40;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    function render() {
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      renderer.render(scene, camera);
      stats.update();
    }
    onMounted(() => {
      init();
      animate();
    });
    return {
      container
    };
  }
});
</script>
<style lang="scss"></style>
