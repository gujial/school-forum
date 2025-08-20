<template>
  <v-card :image="bgSrc" class="d-flex justify-space-between align-center card avatar-bg-mask">
    <div class="bg-mask"/>
    <v-row class="align-center" no-gutters>
      <v-col cols="12" sm="auto" class="d-flex">
        <v-avatar size="120" class="mx-2">
          <v-img cover :src="src" />
        </v-avatar>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppAvatar' })
const props = defineProps<{ user: { user_id: number } }>()
const src = ref('/icon.png')
const bgSrc = ref('/card-image.jpg')

const updateAvatar = async () => {
  try {
    const data = await $fetch<{ success: boolean; data: string }>('/api/avatar/' + props.user.user_id)
    src.value = data.data
  } catch (err) {
    console.log(err)
  }
}

const updateBg = async () => {
  try {
    const data = await $fetch<{ success: boolean; data: string }>('/api/bg/' + props.user.user_id)
    bgSrc.value = data.data || '/card-image.jpg'
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