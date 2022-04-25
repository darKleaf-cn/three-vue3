<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import clearScene from '@/utils/clearScene';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const mouse = [0.5, 0.5];
    let zoompos = -100;
    const minzoomspeed = 0.015;
    let zoomspeed = minzoomspeed;
    let frameId: number;

    let scene: THREE.Scene | null;
    let camera: THREE.PerspectiveCamera | null;
    let renderer: THREE.WebGLRenderer | null;

    const labeldata = [
      { size: 0.01, scale: 0.0001, label: 'microscopic (1µm)' }, // FIXME - triangulating text fails at this size, so we scale instead
      { size: 0.01, scale: 0.1, label: 'minuscule (1mm)' },
      { size: 0.01, scale: 1.0, label: 'tiny (1cm)' },
      { size: 1, scale: 1.0, label: 'child-sized (1m)' },
      { size: 10, scale: 1.0, label: 'tree-sized (10m)' },
      { size: 100, scale: 1.0, label: 'building-sized (100m)' },
      { size: 1000, scale: 1.0, label: 'medium (1km)' },
      { size: 10000, scale: 1.0, label: 'city-sized (10km)' },
      { size: 3400000, scale: 1.0, label: 'moon-sized (3,400 Km)' },
      { size: 12000000, scale: 1.0, label: 'planet-sized (12,000 km)' },
      { size: 1400000000, scale: 1.0, label: 'sun-sized (1,400,000 km)' },
      { size: 7.47e12, scale: 1.0, label: 'solar system-sized (50Au)' },
      { size: 9.4605284e15, scale: 1.0, label: 'gargantuan (1 light year)' },
      { size: 3.08567758e16, scale: 1.0, label: 'ludicrous (1 parsec)' },
      { size: 1e19, scale: 1.0, label: 'mind boggling (1000 light years)' }
    ];

    onMounted(() => {
      init();
      animate();
    });

    onBeforeUnmount(() => {
      destory();
    });

    function init() {
      const loader = new FontLoader();
      loader.load('./static/fonts/helvetiker_regular.typeface.json', function (font: Font) {
        // 初始化场景
        scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0x222222));

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(100, 100, 100);
        scene.add(light);

        const geometry = new THREE.SphereGeometry(0.5, 24, 12);
        for (let i = 0; i < labeldata.length; i++) {
          const scale = labeldata[i].scale || 1;

          const labelgeo = new TextGeometry(labeldata[i].label, {
            font: font,
            size: labeldata[i].size,
            height: labeldata[i].size / 2
          });

          labelgeo.computeBoundingSphere();
          labelgeo.translate(-(labelgeo.boundingSphere as THREE.Sphere).radius, 0, 0);

          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            specular: 0x050505,
            shininess: 50,
            emissive: 0x000000
          });

          const group = new THREE.Group();
          group.position.z = -labeldata[i].size * scale;
          scene.add(group);

          const textmesh = new THREE.Mesh(labelgeo, material);
          textmesh.scale.set(scale, scale, scale);
          textmesh.position.z = -labeldata[i].size * scale;
          textmesh.position.y = (labeldata[i].size / 4) * scale;
          group.add(textmesh);

          const dotmesh = new THREE.Mesh(geometry, material);
          dotmesh.position.y = (-labeldata[i].size / 4) * scale;
          dotmesh.scale.multiplyScalar(labeldata[i].size * scale);
          group.add(dotmesh);
        }

        camera = new THREE.PerspectiveCamera(
          50,
          (window.innerWidth + offsetX) / (window.innerHeight + offsetY),
          1e-6,
          1e27
        );
        scene.add(camera);

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          logarithmicDepthBuffer: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth + offsetX, window.innerHeight + offsetY);
        (container.value as HTMLElement).appendChild(renderer.domElement);

        animate();
      });

      window.addEventListener('resize', onWindowResize);
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
      if (renderer && scene && camera) {
        const minzoom = labeldata[0].size * labeldata[0].scale * 1;
        const maxzoom = labeldata[labeldata.length - 1].size * labeldata[labeldata.length - 1].scale * 100;
        let damping = Math.abs(zoomspeed) > minzoomspeed ? 0.95 : 1.0;

        const zoom = THREE.MathUtils.clamp(Math.pow(Math.E, zoompos), minzoom, maxzoom);
        zoompos = Math.log(zoom);

        if ((zoom === minzoom && zoomspeed < 0) || (zoom === maxzoom && zoomspeed > 0)) {
          damping = 0.85;
        }

        zoompos += zoomspeed;
        zoomspeed *= damping;
        camera.position.x = Math.sin(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom;
        camera.position.y = Math.sin(0.25 * Math.PI * (mouse[1] - 0.5)) * zoom;
        camera.position.z = Math.cos(0.5 * Math.PI * (mouse[0] - 0.5)) * zoom;
        renderer.render(scene, camera);
      }
    }
    function destory() {
      if (scene && renderer) {
        window.removeEventListener('resize', onWindowResize);
        clearScene(scene);
        renderer.dispose();
        renderer.forceContextLoss();
        cancelAnimationFrame(frameId);

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
