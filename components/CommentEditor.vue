<template>
    <v-card
        v-if="user != null"
        :prepend-avatar="avatar_url"
        :title="user.username"
        :subtitle="user.email"
    >
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
        <v-card-text>
            <v-form>
                <v-textarea v-model="comment" :label="$t('inputComments')" auto-grow />
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn text @click="postComment">{{ $t('postComment') }}</v-btn>
            <v-dialog v-model="dialog" max-width="500px">
                <v-card>
                    <v-card-text>{{ $t('commentCanntBeEmpty') }}</v-card-text>
                    <v-btn @click="dialog = false">{{ $t('confirm') }}</v-btn>
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

<script setup lang="ts">
    import CommentArea from '~/components/CommentArea.vue';
    import { ref, onMounted } from 'vue';
    import type { AuthUser } from '~/types/models';

    const user = ref<AuthUser | null>(null);
    const avatar_url = ref<string>('/icon.png');
    const error = ref<string | null>(null);
    const comment = ref<string>('');
    const dialog = ref<boolean>(false);
    const props = defineProps<{
        tweetId: number;
        receiverId: number;
    }>();
    const areaRef = ref<any>(null);

    const emit = defineEmits<{
        'comment-posted': [];
    }>();

    onMounted(async () => {
        try {
            const data = await $fetch<{ success: boolean; user?: AuthUser }>('/api/auth/user');
            user.value = data.user || null;
            if (user.value) {
                const avatar_data = await $fetch<{ success: boolean; data?: string }>(
                    `/api/avatar/${user.value.user_id}`,
                );
                avatar_url.value = avatar_data.data || '/icon.png';
            }
        } catch (err: any) {
            error.value = String(err);
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tweet_id: props['tweetId'],
                    content: comment.value,
                }),
            });

            await $fetch('/api/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tweet_id: props['tweetId'],
                    receiver_id: props['receiverId'],
                    content: comment.value,
                }),
            });

            comment.value = '';
            if (areaRef.value != null) {
                areaRef.value.updateComments();
                emit('comment-posted');
            }
        } catch (err: any) {
            error.value = String(err);
        }
    };
</script>
