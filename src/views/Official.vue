<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onBeforeUpdate, onMounted, ref } from 'vue';
import OfficialThree from './officalThree';
import { useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const container = ref<HTMLElement | null>(null);
    let three: OfficialThree | null;
    onMounted(() => {
      const path = useRoute().path;
      init(path);
    });
    onBeforeUnmount(() => {
      if (three) {
        three.end();
      }
			three = null;
      // three.end();
    });
    onBeforeUpdate(() => {
      if (three) {
        three.end();
      }
      three = null;
      // three.end();
      const path = useRoute().path;
      init(path);
    });
    async function init(path: string) {
      const offsetX = -240;
      const offsetY = -40;
      const Three = await import('@/views' + path).then((module) => {
        return module.default;
      });
      three = new Three(container.value as HTMLElement, offsetX, offsetY);
      if (three) {
        three.start();
      }
      // three.start();
    }
    return {
      container
    };
  }
});
</script>

<style></style>
