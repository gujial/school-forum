<!--
 这段Vue代码实现了一个应用顶部导航栏，包含以下功能：
 1、显示应用标题"TwitterClone"
 2、提供中英文切换按钮，点击切换语言
 3、提供深浅主题切换按钮，点击切换主题模式
 4、包含首页和账户页面的导航链接
-->
<template>
    <v-app-bar app>
        <v-btn icon="mdi-menu" @click="() => { if (navOpen) { navOpen = false } else { navOpen = true } }"></v-btn>
        <v-avatar size="40" class="mx-2" @click="navigateTo(localePath('/'))">
          <v-img cover src="/icon.png" />
        </v-avatar>
        <v-toolbar-title>{{ $t('TwitterClone') }}</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="navOpen" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
        <v-card>
            <v-img class="text-white avatar-bg-mask" height="150px" :src="bgSrc" cover>
                <div class="bg-mask"></div>
                <v-avatar style="z-index: 99; position: relative;" size="80" class="mx-2">
                    <v-img cover :src="src" />
                </v-avatar>
                <v-card-title style="z-index: 99; position: relative;">{{ user && user.username !== 'guest' ? user.username : $t('guestUser')
                    }}</v-card-title>
                <v-card-subtitle style="z-index: 99; position: relative;" v-if="user">{{ user ? user.email : $t('clickAccountToLogin') }}</v-card-subtitle>
            </v-img>
        </v-card>

        <v-divider></v-divider>

        <v-list :lines="false" density="compact" nav>
            <v-list-item :to="localePath('/')" @click="navOpen = false">
                <template v-slot:prepend>
                    <v-icon>mdi-home</v-icon>
                </template>
                <v-list-item-title>{{ $t('home') }}</v-list-item-title>
            </v-list-item>

            <v-list-item :to="localePath('/account')" @click="navOpen = false">
                <template v-slot:prepend>
                    <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>{{ $t('account') }}</v-list-item-title>
            </v-list-item>

            <v-list-item :to="localePath('/messages')" @click="navOpen = false">
                <template v-slot:prepend>
                    <v-icon>mdi-message-text</v-icon>
                </template>
                <v-list-item-title>{{ $t('messages') }}</v-list-item-title>
            </v-list-item>
        </v-list>
        <v-btn text style="width: 100%;" v-if="user && user.admin" @click="navigateTo(localePath('/admin'))">{{ $t('adminDashboard') }}</v-btn>
        <v-btn flat icon="mdi-translate" @click="setLocale(locale === 'en' ? 'zh' : 'en')" />
        <v-btn flat icon="mdi-theme-light-dark" @click="toggleTheme()" />
    </v-navigation-drawer>
</template>

<script setup>
import { useTheme } from 'vuetify'

const colorMode = useColorMode();
const { locale, setLocale } = useI18n()
const localePath = useLocalePath();
const navOpen = shallowRef(false);
const src = ref('/icon.png')
const bgSrc = ref('/card-image.jpg')
const user = useAuthUser()
const theme = useTheme()

const updateAvatar = async () => {
    if (user.value.user_id === -1) return
    try {
        const data = await $fetch('/api/avatar/' + user.value.user_id);
        src.value = data.data;
    } catch (err) {
        console.log(err)
    }
}

const updateBg = async () => {
    if (user.value.user_id === -1) return
    try {
        const data = await $fetch('/api/bg/' + user.value.user_id);
        bgSrc.value = data.data || '/card-image.jpg';
    } catch (err) {
        bgSrc.value = '/card-image.jpg'
    }
}

const toggleTheme = () => {
    if (colorMode.value === 'light') {
        colorMode.preference = 'dark'
    } else if (colorMode.value === 'dark') {
        colorMode.preference = 'light'
    }
}

watch(user, (val) => {
  if (val) {
    updateAvatar()
    updateBg()
  } else {
    src.value = '/icon.png'
    bgSrc.value = '/card-image.jpg'
  }
}, { immediate: true })

watch(
  () => colorMode.value,
  (val) => {
    theme.global.name.value = val === 'dark' ? 'dark' : 'light'
  }
)
</script>

<style scoped>
.background-image {
    position: relative;
}

.bg-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    /* 黑色半透明 */
    transition: background 0.3s;
    z-index: 1;
    pointer-events: none;
}

.avatar-bg-mask:hover .bg-mask {
    background: rgba(0, 0, 0, 0);
    /* 悬浮时透明 */
}
</style>
