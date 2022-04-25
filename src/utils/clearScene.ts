import * as THREE from 'three';
export default function (scene: THREE.Scene): void {
  const arr = scene.children.filter((x) => x);
  arr.forEach((mesh: THREE.Object3D) => {
    if (mesh instanceof THREE.Mesh) {
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        mesh.material.dispose();
      }
      if (mesh.material.texture) {
        mesh.material.texture.dispose();
      }
    }
    if (mesh instanceof THREE.Group) {
      mesh.clear();
    }
    if (mesh instanceof THREE.Object3D) {
      mesh.clear();
    }
  });
  scene.clear();
}
