<template>
  <el-container>
    <el-aside width="200px">
      <el-menu
        :default-active="$route.path"
        router
        unique-opened
      >
        <template v-for="item in navRouter" :key="item.name">
          <el-sub-menu v-if="item.children && !(item.meta ? item.meta.isSingle : false)" :index="item.path">
            <template #title
              ><span>{{ item.name }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :index="item.path + '/' + child.path" :key="child.name">
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <span>{{ item.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
  setup() {
    const navRouter = useRouter().options.routes.filter((router) => {
      return router.meta ? !router.meta.hidden : true;
    });
    console.log(navRouter);
    return {
      navRouter
    };
  }
});
</script>

<style lang="scss">
// .el-aside {
//   border-right: 0.5px solid #545c64;
// }
</style>
