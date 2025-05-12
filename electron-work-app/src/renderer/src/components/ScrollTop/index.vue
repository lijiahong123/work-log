<template>
  <div v-if="isVisible" class="scroll-top" @click="scrollToTop" title="返回顶部">
    <svg class="icon" style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
      viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3630">
      <path
        d="M572.032 204.992v600.96a29.12 29.12 0 0 1-30.016 29.056 29.12 29.12 0 0 1-30.08-29.056v-600.96L292.032 438.976A26.752 26.752 0 0 1 270.976 448a27.648 27.648 0 0 1-21.504-9.536 32.64 32.64 0 0 1-8.512-22.464c0-8.64 3.008-16.32 8.96-23.04l271.04-288a26.752 26.752 0 0 1 20.992-8.96c8.64 0 15.68 3.008 20.992 8.96l271.04 288c5.952 6.72 8.96 14.4 8.96 23.04a32.64 32.64 0 0 1-8.512 22.464 27.072 27.072 0 0 1-20.992 9.536 29.44 29.44 0 0 1-21.504-8.96L572.032 204.928z"
        fill="#383838" p-id="3631"></path>
    </svg>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
defineOptions({
  name: 'ScrollTop',
});
const isVisible = ref(false);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const handleScroll = () => {
  isVisible.value = window.scrollY > 200; // 当滚动超过200px时显示按钮
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.scroll-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.scroll-top:hover {
  background-color: #d0d4d8;
}
</style>
