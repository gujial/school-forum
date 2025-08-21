<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
        <h1 class="text-6xl font-bold text-red-600">403</h1>
        <p class="text-xl mt-4">拒绝访问</p>
        <p class="text-gray-600 mt-2">您没有权限查看此页面</p>
        <NuxtLink
            :to="localePath('/')"
            class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
            返回首页
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
    const localePath = useLocalePath();
</script>
