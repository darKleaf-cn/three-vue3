<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import Three from './index';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
		let three: Three;
    onMounted(() => {
      const offsetX = -240;
      const offsetY = -40;
      three = new Three(container.value as HTMLElement, offsetX, offsetY);
      three.start();
    });
		onBeforeUnmount(() => {
			three.end();
		})
    return {
      container
    };
  }
});
</script>

<style></style>