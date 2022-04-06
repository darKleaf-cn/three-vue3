<template>
  <div class="container" ref="container">1</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Home',
  setup() {
    const container = ref<HTMLElement | null>(null);
    return {
      container
    };
  }
});
</script>
<style lang="scss"></style>
