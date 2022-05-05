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
    // 常用变量
    const container = ref<HTMLElement | null>(null);
    const offsetX = -240;
    const offsetY = -40;
    const startTime = new Date().getTime();
    let frameId: number;

    let scene: THREE.Scene | null;
    let camera: THREE.PerspectiveCamera | null;
    let mesh: THREE.Mesh | null;
    let object: THREE.Group | null;
    let volumeVisualization: THREE.Group | null;
    let renderer: THREE.WebGLRenderer | null;
    let controls: OrbitControls | null;
    let clipMaterial: THREE.MeshPhongMaterial | null;

    // 特有变量
    const vertices = [
      new THREE.Vector3(1, 0, Math.SQRT1_2),
      new THREE.Vector3(-1, 0, Math.SQRT1_2),
      new THREE.Vector3(0, 1, -Math.SQRT1_2),
      new THREE.Vector3(0, -1, -Math.SQRT1_2)
    ];
    const indices = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2];
    const planes = planesFromMesh(vertices, indices);
    const transform = new THREE.Matrix4();
    const tmpMatrix = new THREE.Matrix4();
    const planeToMatrix = (function () {
      const xAxis = new THREE.Vector3();
      const yAxis = new THREE.Vector3();
      const trans = new THREE.Vector3();

      return function planeToMatrix(plane: THREE.Plane) {
        const zAxis = plane.normal;
        const matrix = new THREE.Matrix4();

        if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
          yAxis.set(-zAxis.y, zAxis.x, 0);
        } else {
          yAxis.set(0, -zAxis.z, zAxis.y);
        }
        xAxis.crossVectors(yAxis.normalize(), zAxis);
        plane.coplanarPoint(trans);
        return matrix.set(
          xAxis.x,
          yAxis.x,
          zAxis.x,
          trans.x,
          xAxis.y,
          yAxis.y,
          zAxis.y,
          trans.y,
          xAxis.z,
          yAxis.z,
          zAxis.z,
          trans.z,
          0,
          0,
          0,
          1
        );
      };
    })();
    const planeMatrices = planes.map(planeToMatrix);
    // const globalClippingPlanes = cylindicalPlanes(5, 2.5);
    // const empty = Object.freeze([]);

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
      camera.position.set(0, 1.5, 3);

      // 初始化灯光

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const spotLight = new THREE.SpotLight(0xffffff, 0.5);
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.2;
      spotLight.position.set(2, 3, 3);
      spotLight.castShadow = true;
      spotLight.shadow.camera.near = 3;
      spotLight.shadow.camera.far = 10;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add(spotLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(0, 2, 0);
      dirLight.castShadow = true;
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 10;
      dirLight.shadow.camera.right = 1;
      dirLight.shadow.camera.left = -1;
      dirLight.shadow.camera.top = 1;
      dirLight.shadow.camera.bottom = -1;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // 初始化网格
      clipMaterial = new THREE.MeshPhongMaterial({
        color: 0xee0a10,
        shininess: 100,
        side: THREE.DoubleSide,
        clippingPlanes: createPlanes(planes.length),
        clipShadows: true
      });

      object = new THREE.Group();
      const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);

      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          for (let z = -2; z <= 2; z++) {
            const mesh = new THREE.Mesh(geometry, clipMaterial);
            mesh.position.set(x / 5, y / 5, z / 5);
            mesh.castShadow = true;
            object.add(mesh);
          }
        }
      }
      scene.add(object);

      const planeGeometry = new THREE.PlaneGeometry(3, 3, 1, 1);
      const color = new THREE.Color();

      volumeVisualization = new THREE.Group();
      volumeVisualization.visible = true;
      for (let i = 0; i < planes.length; i++) {
        const material = new THREE.MeshBasicMaterial({
          color: color.setHSL(i / planes.length, 0.5, 0.5).getHex(),
          side: THREE.DoubleSide,
          opacity: 0.2,
          transparent: true,
          clippingPlanes: clipMaterial.clippingPlanes.filter(function (_: THREE.Plane, j: number) {
            return j !== i;
          })
        });

        const mesh = new THREE.Mesh(planeGeometry, material);
        mesh.matrixAutoUpdate = false;
        volumeVisualization.add(mesh);
      }
      scene.add(volumeVisualization);

      const ground = new THREE.Mesh(
        planeGeometry,
        new THREE.MeshPhongMaterial({
          color: 0xa0adaf,
          shininess: 10
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.scale.multiplyScalar(3);
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
    function planesFromMesh(vertices: Array<THREE.Vector3>, indices: Array<number>) {
      const n = indices.length / 3;
      const result: Array<THREE.Plane> = new Array(n);
      for (let i = 0, j = 0; i < n; i++, j += 3) {
        const a = vertices[indices[j]];
        const b = vertices[indices[j + 1]];
        const c = vertices[indices[j + 2]];
        result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c);
      }
      return result;
    }
    function setObjectWorldMatrix(object: THREE.Mesh, matrix: THREE.Matrix4) {
      // set the orientation of an object based on a world matrix
      if (scene) {
        const parent = object.parent;
        scene.updateMatrixWorld();
        object.matrix.copy((parent as THREE.Group).matrixWorld).invert();
        object.applyMatrix4(matrix);
      }
    }
    function createPlanes(n: number) {
      const result: Array<THREE.Plane> = new Array(n);
      for (let i = 0; i < n; i++) {
        result[i] = new THREE.Plane();
      }
      return result;
    }
    // function cylindicalPlanes(n: number, innerRadius: number) {
    //   const result = createPlanes(n);
    //   for (let i = 0; i !== n; i++) {
    //     const plane = result[i];
    //     const angle = (i * Math.PI * 2) / n;
    //     plane.normal.set(Math.cos(angle), 0, Math.sin(angle));
    //     plane.constant = innerRadius;
    //   }
    //   return result;
    // }
    function assignTransformedPlanes(
      planesOut: Array<THREE.Plane>,
      planesIn: Array<THREE.Plane>,
      matrix: THREE.Matrix4
    ) {
      // sets an array of existing planes to transformed 'planesIn'

      for (let i = 0, n = planesIn.length; i !== n; ++i) planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
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
      if (renderer && scene && camera && object && clipMaterial && volumeVisualization) {
        const currentTime = new Date().getTime();
        const time = (currentTime - startTime) / 1000;

        object.position.y = 1;
        object.rotation.x = time * 0.5;
        object.rotation.y = time * 0.2;
        object.updateMatrix();

        transform.copy(object.matrix);

        const bouncy = Math.cos(time * 0.5) * 0.5 + 0.7;
        transform.multiply(tmpMatrix.makeScale(bouncy, bouncy, bouncy));

        assignTransformedPlanes(clipMaterial.clippingPlanes, planes, transform);

        const planeMeshes = volumeVisualization.children;

        for (let i = 0, n = planeMeshes.length; i !== n; ++i) {
          tmpMatrix.multiplyMatrices(transform, planeMatrices[i]);
          const a = planeMeshes[i];
          if (a instanceof THREE.Mesh) {
            setObjectWorldMatrix(a, tmpMatrix);
          }
        }

        transform.makeRotationY(time * 0.1);

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
