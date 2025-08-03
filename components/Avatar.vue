<template>
  <v-card image="/card-image.jpg" class="d-flex justify-space-between align-center card">
    <v-avatar size="200">
      <v-img cover :src='src'/>
    </v-avatar>
  </v-card>
</template>

<script setup>
const props = defineProps({
  user: String()
});
const src = ref('/icon.png')
const sheet = ref(false)
const file = ref(null)
const dialog = ref(null)

const updateAvatar = async () => {
  try {
    const data = await $fetch('/api/avatar/' + props.user.user_id);
    src.value = data.data;
  } catch (err) {
    console.log(err)
  }
}

onMounted(updateAvatar);

</script>

<style scoped>
.card {
  padding: 10px;
}
</style>