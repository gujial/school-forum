<template>
    <v-card class="d-flex justify-space-between align-center card avatar-bg-mask">
        <template #image="">
            <v-img cover :src="bgSrc">
                <template #placeholder>
                    <v-progress-linear color="primary" height="4" indeterminate></v-progress-linear>
                </template>
            </v-img>
        </template>
        <div class="bg-mask" />
        <v-row class="align-center" no-gutters>
            <v-col cols="12" sm="auto" class="d-flex">
                <v-avatar size="120" class="mx-2">
                    <v-img cover :src="src">
                        <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                    color="grey-lighten-4"
                                    indeterminate
                                ></v-progress-circular>
                            </div>
                        </template>
                    </v-img>
                </v-avatar>
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
    defineOptions({ name: 'AppAvatar' });
    const props = defineProps<{ user: { user_id: number } }>();
    const src = ref('/icon.png');
    const bgSrc = ref('/card-image.jpg');

    const updateAvatar = async () => {
        try {
            const data = await $fetch<{ success: boolean; data: string }>(
                '/api/avatar/' + props.user.user_id,
            );
            src.value = data.data;
        } catch (err) {
            console.error(err);
        }
    };

    const updateBg = async () => {
        try {
            const data = await $fetch<{ success: boolean; data: string }>(
                '/api/bg/' + props.user.user_id,
            );
            bgSrc.value = data.data || '/card-image.jpg';
        } catch {
            bgSrc.value = '/card-image.jpg';
        }
    };

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
        background: rgba(0, 0, 0, 0.45); /* 黑色半透明 */
        transition: background 0.3s;
        z-index: 1;
        pointer-events: none;
    }
    .avatar-bg-mask:hover .bg-mask {
        background: rgba(0, 0, 0, 0); /* 悬浮时透明 */
    }
    .v-avatar {
        z-index: 2;
    }
</style>
