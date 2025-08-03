<template>
  <v-card :image="bgSrc" class="d-flex justify-space-between align-center card avatar-bg-mask">
    <div class="bg-mask"></div>
    <v-avatar size="200">
      <v-img cover :src='src'/>
    </v-avatar>
    <v-card-actions>
      <v-btn
        variant="flat"
        color="yellow-darken-2"
        class="mx-2"
        style="z-index: 99;"
        @click="sheet = !sheet"
      >
        {{ $t('changeAvatar') }}
      </v-btn>
      <v-btn
        variant="flat"
        color="blue-darken-2"
        class="mx-2"
        style="z-index: 99;"
        @click="bgSheet = !bgSheet"
      >
        {{ $t('changeBg') }}
      </v-btn>
    </v-card-actions>
  </v-card>
  <!-- 头像上传 -->
  <v-bottom-sheet v-model="sheet" inset>
    <v-card class="text-center card">
      <v-card-text>
        <v-file-input
          v-model="file" :label="$t('inputImage')" accept="image/*"
          prepend-icon="mdi-camera"/>
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
          v-model="bgFile" :label="$t('inputBg')" accept="image/*"
          prepend-icon="mdi-image"/>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="submitBg">{{ $t('upload') }}</v-btn>
        <v-btn text @click="bgSheet = !bgSheet">{{ $t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
  <v-dialog v-model="dialog" width="auto">
    <v-card max-width="400" prepend-icon="mdi-update" :text="$t('inputImageFirst')" :title="$t('noSelectedFile')">
      <template #actions>
        <v-btn class="ms-auto" text="Ok" @click="dialog = false"/>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  user: Object
});
const src = ref('/icon.png')
const bgSrc = ref('/card-image.jpg')
const sheet = ref(false)
const bgSheet = ref(false)
const file = ref(null)
const bgFile = ref(null)
const dialog = ref(null)

const submit = async () => {
  if (file.value) {
    const formData = new FormData()
    formData.append('file', file.value)
    try {
      await $fetch('/api/avatar/upload/' + props.user.user_id, {
        method: 'POST',
        body: formData,
      })
      sheet.value = false
      updateAvatar()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  } else {
    dialog.value = true
  }
}

const submitBg = async () => {
  if (bgFile.value) {
    const formData = new FormData()
    formData.append('file', bgFile.value)
    try {
      await $fetch('/api/bg/upload/' + props.user.user_id, {
        method: 'POST',
        body: formData,
      })
      bgSheet.value = false
      updateBg()
    } catch (error) {
      console.error('Upload bg failed:', error)
    }
  } else {
    dialog.value = true
  }
}

const updateAvatar = async () => {
  try {
    const data = await $fetch('/api/avatar/' + props.user.user_id);
    src.value = data.data;
  } catch (err) {
    console.log(err)
  }
}

const updateBg = async () => {
  try {
    const data = await $fetch('/api/bg/' + props.user.user_id);
    bgSrc.value = data.data || '/card-image.jpg';
  } catch (err) {
    bgSrc.value = '/card-image.jpg'
  }
}

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
  background: rgba(0,0,0,0.45); /* 黑色半透明 */
  transition: background 0.3s;
  z-index: 1;
  pointer-events: none;
}
.avatar-bg-mask:hover .bg-mask {
  background: rgba(0,0,0,0); /* 悬浮时透明 */
}
.v-avatar {
  z-index: 2;
}
</style>