<template>
  <v-card :image="bgSrc" class="d-flex justify-space-between align-center card">
    <v-avatar size="200" class="avatar-border">
      <v-img cover :src='src'/>
    </v-avatar>
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
}
.avatar-border {
  border: 4px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>