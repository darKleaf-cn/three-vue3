<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Three from './index';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    onMounted(() => {
      const offsetX = -240;
      const offsetY = -40;
      const three = new Three(container.value as HTMLElement, offsetX, offsetY);
      three.animate();
    });
    return {
      container
    };
  }
});
</script>

<style lang="scss">
.selectBox {
  border: 1px solid #55aaff;
  background-color: rgba(75, 160, 255, 0.3);
  position: fixed;
}
</style>