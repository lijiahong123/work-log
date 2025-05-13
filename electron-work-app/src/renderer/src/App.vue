<script setup lang="ts">
import Home from './views/Home/HomeView.vue';
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'

</script>

<template>
  <el-config-provider :locale="zhCn">
    <Home />
  </el-config-provider>
</template>
