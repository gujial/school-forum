<template>
    <div class="tag-editor">
        <v-text-field v-model="inputTag" :label="$t('tags')" @keydown.enter.prevent="addTag" @blur="addTag"
            placeholder="请输入标签，按回车或逗号添加" clearable />
            <span>{{ $t('presetTags') }}: </span>
        <v-btn @click="()=>{tags.push('school');emit('update:modelValue', tags)}">{{ $t('school') }}</v-btn>
        <div class="tag-list" v-if="tags.length > 0">
            <v-chip v-for="(tag, index) in tags" :key="index" close @click:close="removeTag(index)" class="ma-1"
                color="primary" text-color="white">
                {{ tag }}
            </v-chip>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue']);

const inputTag = ref('');
const tags = ref([...props.modelValue]);

watch(
    () => props.modelValue,
    (newVal) => {
        tags.value = [...newVal];
    }
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

function removeTag(index) {
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
