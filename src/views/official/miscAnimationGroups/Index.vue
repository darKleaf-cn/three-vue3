<template>
  <div class="container" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TH from './index';

export default defineComponent({
  setup() {
    const a = new TH();
    return {
      a
    };
  }
});
</script>

<style></style>
