<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
    useSeoMeta({
        title: '可圈可点”校园论坛平台',
        description: 'Web应用开发大作业🥵🥵🥵',
        ogTitle: '可圈可点”校园论坛平台',
        ogDescription: 'Web应用开发大作业🥵🥵🥵',
        ogImage: '/icon.png',
        ogUrl: 'https://oneyear.asia/',
        twitterTitle: '可圈可点”校园论坛平台',
        twitterDescription: 'Web应用开发大作业🥵🥵🥵',
        twitterImage: '/icon.png',
        twitterCard: 'summary_large_image',
    });

    useHead({
        htmlAttrs: {
            lang: 'zh-cn',
        },
        link: [
            {
                rel: 'icon',
                type: 'image/png',
                href: '/icon.png',
            },
        ],
    });
</script>
