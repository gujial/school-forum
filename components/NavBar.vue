<!--
 这段Vue代码实现了一个应用顶部导航栏，包含以下功能：
 1、显示应用标题"TwitterClone"
 2、提供中英文切换按钮，点击切换语言
 3、提供深浅主题切换按钮，点击切换主题模式
 4、包含首页和账户页面的导航链接
-->
<template>
    <v-app-bar app>
        <v-toolbar-title>{{ $t('TwitterClone') }}</v-toolbar-title>
        <v-btn icon="mdi-translate" @click="setLocale(locale === 'en' ? 'zh' : 'en')" />
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme()"/>
        <v-btn icon="mdi-home" :to="localePath('/')"/>
        <v-btn icon="mdi-account" :to="localePath('/account')"/>
    </v-app-bar>
</template>

<script setup>
const colorMode = useColorMode();
const { locale, setLocale } = useI18n()
const localePath = useLocalePath();

const toggleTheme = () => {
    console.log(colorMode.value)
    if (colorMode.value === 'light') {
        colorMode.preference = 'dark'
    } else if (colorMode.value === 'dark') {
        colorMode.preference = 'light'
    }
}
</script>

