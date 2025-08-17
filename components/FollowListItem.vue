<template>
    <v-card :image="bgSrc" class="d-flex justify-space-between align-center card avatar-bg-mask"
        @click="navigateTo(localePath('/profile/' + props.userId))">
        <div class="bg-mask"></div>
        <v-row class="align-center" no-gutters>
            <v-col cols="6" sm="auto" class="d-flex">
                <v-avatar size="120" class="mx-2">
                    <v-img cover :src="src" />
                </v-avatar>
            </v-col>
            <v-col cols="6" sm="auto" class="d-flex justify-space-between">
                <div>
                    <v-card-title style="z-index: 99; position: relative;">{{ user ? user.username : $t('guestUser')
                        }}</v-card-title>
                    <v-card-subtitle style="z-index: 99; position: relative;" v-if="user">{{ user ? user.email :
                        $t('clickAccountToLogin') }}</v-card-subtitle>
                </div>
            </v-col>
        </v-row>
        <v-card-actions v-if="unfollowable">
            <v-btn style="z-index: 99; position: relative;" @click.stop="unfolowUser(props.userId)">{{ $t('unfollow') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
const props = defineProps({
    userId: Number,
    unfollowable: Boolean
});
const src = ref('/icon.png')
const bgSrc = ref('/card-image.jpg')
const user = ref(null)
const localePath = useLocalePath();
const emit = defineEmits(['unfollow'])

const updateUser = async () => {
    try {
        const data = await $fetch('/api/user/' + props.userId);
        user.value = data.user;
    } catch (err) {
        console.log(err)
    }
}

const updateAvatar = async () => {
    try {
        const data = await $fetch('/api/avatar/' + props.userId);
        src.value = data.data;
    } catch (err) {
        console.log(err)
    }
}

const updateBg = async () => {
    try {
        const data = await $fetch('/api/bg/' + props.userId);
        bgSrc.value = data.data || '/card-image.jpg';
    } catch (err) {
        bgSrc.value = '/card-image.jpg'
    }
}

const unfolowUser = async (id) => {
    try {
        await $fetch(`/api/follow/${id}`, {method: 'DELETE'})
        emit('unfollow')
    } catch (err) {
        console.log(err)
    }
}

onMounted(() => {
    updateAvatar();
    updateBg();
    updateUser();
});

</script>

<style scoped>
.card {
    padding: 10px;
    position: relative;
    overflow: hidden;
    margin: 10px;
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

.v-avatar {
    z-index: 2;
}
</style>