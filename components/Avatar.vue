<!--
 这段Vue代码实现了一个用户信息卡片组件。主要功能包括：

  1、展示用户头像和背景图：通过v-avatar和v-card显示用户头像及背景图片
  2、动态获取图片资源：挂载时调用API获取用户头像和背景图URL
  3、悬停效果：鼠标悬停时背景遮罩变透明，增强交互体验
  4、错误处理：图片加载失败时使用默认图片
-->

<template>
  <v-card :image="bgSrc" class="d-flex justify-space-between align-center card avatar-bg-mask">
    <div class="bg-mask"></div>
    <v-row class="align-center" no-gutters>
      <v-col cols="12" sm="auto" class="d-flex">
        <v-avatar size="120" class="mx-2">
          <v-img cover :src="src" />
        </v-avatar>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
const props = defineProps({
  user: String()
});
const src = ref('/icon.png')
const bgSrc = ref('/card-image.jpg')

const updateAvatar = async () => {
  try {
    const data = await $fetch('/api/avatar/' + props.user.user_id);
    src.value = data.data;
  } catch (err) {
    console.log(err)
  }
}

const updateBg = async () => {
  try {
    const data = await $fetch('/api/bg/' + props.user.user_id);
    bgSrc.value = data.data || '/card-image.jpg';
  } catch (err) {
    bgSrc.value = '/card-image.jpg'
  }
}

onMounted(() => {
  updateAvatar();
  updateBg();
});

</script>

<style scoped>
.card {
  padding: 10px;
  position: relative;
  overflow: hidden;
  min-height: 500px; /* 最小高度 */
  background-size: cover; /* 填充背景图片 */
  background-repeat: no-repeat; /* 不重复 */
  background-position: center; /* 中心对齐 */
}

.bg-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45); /* 黑色半透明 */
  transition: background 0.3s;
  z-index: 1;
  pointer-events: none;
}
.avatar-bg-mask:hover .bg-mask {
  background: rgba(0,0,0,0); /* 悬浮时透明 */
}
.v-avatar {
  z-index: 2;
}
</style>