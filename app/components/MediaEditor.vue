<template>
    <v-container>
        <v-row>
            <v-col>
                <v-btn class="button">
                    {{ t('MediaSelector') }}
                    <v-menu activator="parent">
                        <v-list>
                            <v-list-item
                                v-for="(item, index) in items"
                                :key="index"
                                :value="index"
                                @click="selectedMedia = index"
                            >
                                <v-list-item-title>{{ item }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-btn>

                <v-file-input
                    v-if="selectedMedia == 1"
                    v-model="imageFiles"
                    :label="t('uploadImages')"
                    accept="image/*"
                    multiple
                    @update:model-value="checkFiles($event, 'image')"
                />

                <v-file-input
                    v-if="selectedMedia == 2"
                    v-model="videoFile"
                    :label="t('uploadvideo')"
                    accept="video/*"
                    @update:model-value="checkFiles($event, 'video')"
                />
                <v-progress-linear
                    v-if="uploading"
                    :model-value="uploadProgress"
                    height="8"
                    color="blue"
                    striped
                    animated
                    class="my-4 rounded-lg"
                />
                <p>{{ t('fileCannotOver200M') }}</p>
            </v-col>
        </v-row>
    </v-container>
    <v-dialog v-model="dialog" max-width="400">
        <v-card>
            <v-card-title class="text-h6">{{ t('fileTooBig') }}</v-card-title>
            <v-card-text>{{ dialogMessage }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="primary" text @click="dialog = false">{{ t('confirm') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
    import { MAX_FILE_SIZE } from '../../types/models';
    const imageFiles = ref<File[]>([]);

    const videoFile = ref<File | null>(null);

    const { t } = useI18n();
    const items = ref<string[]>([t('none'), t('images'), t('video')]);

    const selectedMedia = ref<number>(0);

    const successMessage = ref<string>('');
    const errorMessage = ref<string>('');
    const dialog = ref(false);
    const dialogMessage = ref('');
    const uploadProgress = ref(0);
    const uploading = ref(false);

    const checkFiles = (files: File[] | File | null, type: 'image' | 'video') => {
        if (!files) return;

        const fileList = Array.isArray(files) ? files : [files];

        for (const file of fileList) {
            if (file.size > MAX_FILE_SIZE) {
                dialogMessage.value =
                    type === 'image'
                        ? `图片 ${file.name} 超过 200M，无法上传！`
                        : `视频 ${file.name} 超过 200M，无法上传！`;
                dialog.value = true;

                // ❗ 清空输入框里的非法文件
                if (type === 'image') {
                    imageFiles.value = imageFiles.value.filter((f) => f.size <= MAX_FILE_SIZE);
                } else {
                    videoFile.value = null;
                }
                break;
            }
        }
    };

    const upload = async (tweet_id: number) => {
        if (selectedMedia.value == 0) {
            return;
        }

        const formData = new FormData();
        let url = '';

        if (selectedMedia.value == 1) {
            if (imageFiles.value.length == 0) return;
            for (const file of imageFiles.value) {
                if (file.size > MAX_FILE_SIZE) {
                    dialogMessage.value = `图片 ${file.name} 超过200M，无法上传！`;
                    dialog.value = true;
                    return;
                }
                formData.append('file', file);
            }
            url = `/api/media/upload/images/${tweet_id}`;
        } else {
            if (!videoFile.value) return;
            if (videoFile.value.size > MAX_FILE_SIZE) {
                dialogMessage.value = `视频 ${videoFile.value.name} 超过200M，无法上传！`;
                dialog.value = true;
                return;
            }
            formData.append('file', videoFile.value);
            url = `/api/media/upload/video/${tweet_id}`;
        }

        uploading.value = true;
        uploadProgress.value = 0;

        try {
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        uploadProgress.value = Math.round((event.loaded / event.total) * 100);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        successMessage.value = 'Upload successful!';
                        errorMessage.value = '';
                        resolve();
                    } else {
                        errorMessage.value = 'Error uploading files!';
                        successMessage.value = '';
                        reject(new Error(xhr.statusText));
                    }
                };

                xhr.onerror = () => {
                    errorMessage.value = 'Network error!';
                    successMessage.value = '';
                    reject(new Error('Network error'));
                };

                xhr.send(formData);
            });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            uploading.value = false;
        }
    };

    defineExpose({ upload });
</script>

<style scoped>
    .button {
        margin-bottom: 20px;
    }
</style>
