<template>
    <div class="tag-editor">
        <v-text-field
            v-model="inputTag"
            :label="$t('tags')"
            placeholder="请输入标签，按回车或逗号添加"
            clearable
            @keydown.enter.prevent="addTag"
            @blur="addTag"
        />
        <span>{{ $t('presetTags') }}: </span>
        <v-btn flat @click="addTagFromPreset(['school'])">{{ $t('school') }}</v-btn>
        <v-btn flat @click="addTagFromPreset(['school', 'biaobai'])">{{ $t('biaobai') }}</v-btn>
        <v-btn flat @click="addTagFromPreset(['school', 'help'])">{{ $t('help') }}</v-btn>
        <v-btn flat @click="addTagFromPreset(['school', 'news'])">{{ $t('news') }}</v-btn>
        <div v-if="tags.length > 0" class="tag-list">
            <v-chip
                v-for="(tag, index) in tags"
                :key="tag"
                closable
                class="ma-1"
                color="primary"
                text-color="white"
                @click:close="removeTag(index)"
            >
                {{ tag }}
            </v-chip>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';

    const props = defineProps<{
        modelValue: string[];
    }>();

    const emit = defineEmits<{
        'update:modelValue': [value: string[]];
    }>();

    const inputTag = ref<string>('');
    const tags = ref<string[]>([...props.modelValue]);

    watch(
        () => props.modelValue,
        (newVal) => {
            tags.value = [...newVal];
        },
    );

    function addTag() {
        const rawTags = inputTag.value.split(',');
        rawTags.forEach((t) => {
            const trimmed = t.trim();
            if (trimmed && !tags.value.includes(trimmed)) {
                tags.value.push(trimmed);
            }
        });
        inputTag.value = '';
        emit('update:modelValue', tags.value);
    }

    function addTagFromPreset(presetTags: string[]) {
        presetTags.forEach((tag: string) => {
            if (!tags.value.includes(tag)) {
                tags.value.push(tag);
            }
        });
        emit('update:modelValue', tags.value);
    }
    function removeTag(index: number) {
        tags.value.splice(index, 1);
        emit('update:modelValue', tags.value);
    }
</script>

<style scoped>
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        margin-top: 4px;
    }
</style>
