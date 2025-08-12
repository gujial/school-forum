<!--
  这段Vue代码实现了一个评论组件。主要功能包括：
  1、判断用户是否登录，未登录则提示先登录；
  2、登录用户可输入评论内容并提交；
  3、提交前校验评论不能为空，为空则弹窗提示；
  4、评论成功后清空输入框并刷新评论列表；
  5、使用CommentArea子组件展示评论内容。
-->

<template>
    <v-card v-if="user != null" :prepend-avatar="avatar_url" :title="user.username" :subtitle="user.email">
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
        <v-card-text>
            <v-form>
                <v-textarea v-model="comment" :label="$t('inputComments')" auto-grow/>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn text @click="postComment">{{ $t('postComment') }}</v-btn>
            <v-dialog v-model="dialog" max-width="500px">
                <v-card>
                    <v-card-text>{{ $t('commentCanntBeEmpty') }}</v-card-text>
                    <v-btn @click="dialog=false">{{ $t('confirm') }}</v-btn>
                </v-card>
            </v-dialog>
        </v-card-actions>
        <v-card-title>{{ $t('commentAreaTitle') }}</v-card-title>
        <CommentArea ref="areaRef" :tweet-id="props['tweetId']" />
    </v-card>
    <v-card v-else>
        <v-card-title>{{ $t('loginFirst') }}</v-card-title>
        <v-card-title>{{ $t('commentAreaTitle') }}</v-card-title>
        <CommentArea ref="areaRef" :tweet-id="props['tweetId']" />
    </v-card>
</template>

<script setup>
import CommentArea from '~/components/CommentArea.vue';
import { ref, onMounted } from 'vue';

const user = ref(null)
const avatar_url = ref('/icon.png')
const error = ref(null)
const comment = ref('')
const dialog = ref(false)
const props = defineProps({
    tweetId: Number()
});
const areaRef = ref(null)

const emit = defineEmits(['comment-posted'])

onMounted(async () => {
    try {
        const data = await $fetch('/api/auth/user');
        user.value = data.user;
        const avatar_data = await $fetch(`/api/avatar/${user.value.user_id}`)
        avatar_url.value = avatar_data.data
    } catch (err) {
        error.value = err
    }
});

const postComment = async () => {
    if (comment.value.trim() === '') {
        dialog.value = true;
        return;
    }

    try {
        await $fetch('/api/comment/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tweet_id: props['tweetId'],
                content: comment.value
            })
        })
        comment.value = ''
        if (areaRef.value != null) {
            areaRef.value.updateComments()
            emit('comment-posted')
        }
    } catch (err) {
        error.value = err
    }
}
</script>