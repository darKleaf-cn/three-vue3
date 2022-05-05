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
    // let clock = new THREE.Clock();

    let scene: THREE.Scene | null;
    let camera: THREE.PerspectiveCamera | null;
    let renderer: THREE.WebGLRenderer | null;
    let controls: OrbitControls | null;
    let planeObjects: Array<THREE.Mesh> | null;
		let clipPlanes: Array<THREE.Plane> | null;

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
      camera = new THREE.PerspectiveCamera(36, (window.innerWidth + offsetX) / (window.innerHeight + offsetY), 1, 100);
      camera.position.set(2, 2, 2);

      // 初始化灯光
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(5, 10, 7.5);
      dirLight.castShadow = true;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.left = -2;
      dirLight.shadow.camera.top = 2;
      dirLight.shadow.camera.bottom = -2;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // 初始化网格
      clipPlanes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
      ];

      const group = new THREE.Group();
      const geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 220, 60);
      // for (let i = 0; i < 3; i++) {
      //   const material = new THREE.MeshStandardMaterial({
      //     color: 0xffc107,
      //     side: THREE.DoubleSide,
      //     clippingPlanes: clipPlanes,
      //     clipIntersection: false
      //   });
      //   group.add(new THREE.Mesh(geometry, material));
      // }
      scene.add(group);

      const planeGeometry = new THREE.PlaneGeometry(4, 4);
      planeObjects = [];
      for (let i = 0; i < 3; i++) {
        const poGroup = new THREE.Group();
        const plane = clipPlanes[i];
        const stencliGroup = createPlaneStencilGroup(geometry, plane, i + 1);
        group.add(stencliGroup);

        const planeMat = new THREE.MeshStandardMaterial({
          color: 0xe91e63,
          metalness: 0.1,
          roughness: 0.75,
          clippingPlanes: clipPlanes.filter((p) => p !== plane),
          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp
        });
        const po = new THREE.Mesh(planeGeometry, planeMat);
        po.onAfterRender = function (renderer) {
          renderer.clearStencil();
        };
        po.renderOrder = i + 1.1;
        poGroup.add(po);
        planeObjects.push(po);
        scene.add(poGroup);
      }

      const material = new THREE.MeshStandardMaterial({
        color: 0xffc107,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: clipPlanes,
        clipShadows: true,
        shadowSide: THREE.DoubleSide
      });

      // add the color
      const clippedColorFront = new THREE.Mesh(geometry, material);
      clippedColorFront.castShadow = true;
      clippedColorFront.renderOrder = 6;
      group.add(clippedColorFront);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(9, 9, 1, 1),
        new THREE.ShadowMaterial({
          color: 0x000000,
          opacity: 0.25,
          side: THREE.DoubleSide
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1;
      ground.receiveShadow = true;
      scene.add(ground);

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
      renderer.setClearColor(0x263238);
      renderer.shadowMap.enabled = true;
      (container.value as HTMLElement).appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);

      // 初始化控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener('change', render);
      controls.minDistance = 1;
      controls.maxDistance = 10;
    }
    function createPlaneStencilGroup(geometry: THREE.TorusKnotGeometry, plane: THREE.Plane, renderOrder: number) {
      const group = new THREE.Group();
      const baseMat = new THREE.MeshBasicMaterial();
      baseMat.depthWrite = false;
      baseMat.depthTest = false;
      baseMat.colorWrite = false;
      baseMat.stencilWrite = true;
      baseMat.stencilFunc = THREE.AlwaysStencilFunc;

      // back faces
      const mat0 = baseMat.clone();
      mat0.side = THREE.BackSide;
      mat0.clippingPlanes = [plane];
      mat0.stencilFail = THREE.IncrementWrapStencilOp;
      mat0.stencilZFail = THREE.IncrementWrapStencilOp;
      mat0.stencilZPass = THREE.IncrementWrapStencilOp;

      const mesh0 = new THREE.Mesh(geometry, mat0);
      mesh0.renderOrder = renderOrder;
      group.add(mesh0);

      // front faces
      const mat1 = baseMat.clone();
      mat1.side = THREE.FrontSide;
      mat1.clippingPlanes = [plane];
      mat1.stencilFail = THREE.DecrementWrapStencilOp;
      mat1.stencilZFail = THREE.DecrementWrapStencilOp;
      mat1.stencilZPass = THREE.DecrementWrapStencilOp;

      const mesh1 = new THREE.Mesh(geometry, mat1);
      mesh1.renderOrder = renderOrder;
      group.add(mesh1);

      return group;
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
      if (renderer && scene && camera && planeObjects && clipPlanes) {
        for (let i = 0; i < planeObjects.length; i++) {
          const plane = clipPlanes[i];
          const po = planeObjects[i];
          plane.coplanarPoint(po.position);
          po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z);
        }
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
