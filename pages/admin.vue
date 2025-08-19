<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
    <h1 class="text-6xl font-bold text-red-600">200</h1>
    <p class="text-xl mt-4">允许访问</p>
  </div>
</template>

<script setup>
const currentUser = useAuthUser();
const localePath = useLocalePath();

onMounted(() => {
  if (currentUser.value !== null && !currentUser.value.admin) {
    navigateTo(localePath('/forbidden'))
  }
})

</script>