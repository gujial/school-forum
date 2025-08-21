<template>
    <v-card :image="bgSrc" class="card avatar-bg-mask">
        <div class="bg-mask" />
        <v-row class="align-center" no-gutters>
            <v-col cols="12" sm="auto" class="d-flex">
                <v-avatar size="120" class="mx-2">
                    <v-img cover :src="src" />
                </v-avatar>
            </v-col>
            <v-col cols="12" sm="auto" class="d-flex">
                <v-btn
                    variant="text"
                    color="yellow-darken-2"
                    class="mx-2"
                    style="z-index: 99"
                    @click="sheet = !sheet"
                >
                    {{ $t('changeAvatar') }}
                </v-btn>
                <v-btn
                    variant="text"
                    color="blue-darken-2"
                    class="mx-2"
                    style="z-index: 99"
                    @click="bgSheet = !bgSheet"
                >
                    {{ $t('changeBg') }}
                </v-btn>
            </v-col>
        </v-row>
        <v-card-actions style="display: none" />
    </v-card>

    <!-- 头像上传 -->
    <v-bottom-sheet v-model="sheet" inset>
        <v-card class="text-center card">
            <v-card-text>
                <v-file-input
                    v-model="file"
                    :label="$t('inputImage')"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                />
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="submit">{{ $t('upload') }}</v-btn>
                <v-btn text @click="sheet = !sheet">{{ $t('close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>

    <!-- 背景上传 -->
    <v-bottom-sheet v-model="bgSheet" inset>
        <v-card class="text-center card">
            <v-card-text>
                <v-file-input
                    v-model="bgFile"
                    :label="$t('inputBg')"
                    accept="image/*"
                    prepend-icon="mdi-image"
                />
            </v-card-text>
            <v-card-actions>
                <v-btn text @click="submitBg">{{ $t('upload') }}</v-btn>
                <v-btn text @click="bgSheet = !bgSheet">{{ $t('close') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>

    <!-- 无文件提示 -->
    <v-dialog v-model="dialog" width="auto">
        <v-card
            max-width="400"
            prepend-icon="mdi-update"
            :text="$t('inputImageFirst')"
            :title="$t('noSelectedFile')"
        >
            <template #actions>
                <v-btn class="ms-auto" text @click="dialog = false">Ok</v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import type { User } from '~/types/models';
    // ==== Props ====
    const props = defineProps<{
        user: User;
    }>();

    // ==== 状态 ====
    const src = ref<string>('/icon.png');
    const bgSrc = ref<string>('/card-image.jpg');
    const sheet = ref<boolean>(false);
    const bgSheet = ref<boolean>(false);
    const dialog = ref<boolean>(false);
    const file = ref<File | null>(null);
    const bgFile = ref<File | null>(null);

    // ==== 方法 ====
    const submit = async (): Promise<void> => {
        if (!file.value) {
            dialog.value = true;
            return;
        }
        const formData = new FormData();
        formData.append('file', file.value);
        try {
            await $fetch(`/api/avatar/upload/${props.user.user_id}`, {
                method: 'POST',
                body: formData,
            });
            sheet.value = false;
            await updateAvatar();
        } catch (err: any) {
            console.error('Upload failed:', err);
        }
    };

    const submitBg = async (): Promise<void> => {
        if (!bgFile.value) {
            dialog.value = true;
            return;
        }
        const formData = new FormData();
        formData.append('file', bgFile.value);
        try {
            await $fetch(`/api/bg/upload/${props.user.user_id}`, {
                method: 'POST',
                body: formData,
            });
            bgSheet.value = false;
            await updateBg();
        } catch (err: any) {
            console.error('Upload bg failed:', err);
        }
    };

    const updateAvatar = async (): Promise<void> => {
        try {
            const res = await $fetch<{ data?: string }>(`/api/avatar/${props.user.user_id}`);
            src.value = res.data ?? '/icon.png';
        } catch (err: any) {
            console.error(err);
            src.value = '/icon.png';
        }
    };

    const updateBg = async (): Promise<void> => {
        try {
            const res = await $fetch<{ data?: string }>(`/api/bg/${props.user.user_id}`);
            bgSrc.value = res.data ?? '/card-image.jpg';
        } catch (err: any) {
            console.error(err);
            bgSrc.value = '/card-image.jpg';
        }
    };

    // ==== 初始化 ====
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
        background: rgba(0, 0, 0, 0.45);
        transition: background 0.3s;
        z-index: 1;
        pointer-events: none;
    }
    .avatar-bg-mask:hover .bg-mask {
        background: rgba(0, 0, 0, 0);
    }
    .v-avatar {
        z-index: 2;
    }
</style>
