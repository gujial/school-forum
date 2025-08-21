<template>
    <v-card
        v-if="user != null && user.user_id != -1"
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
    import { ref } from 'vue';

    const user = useAuthUser();
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

    watch(
        user,
        async (val) => {
            if (val) {
                try {
                    if (user.value && user.value.user_id != -1) {
                        const avatar_data = await $fetch<{ success: boolean; data?: string }>(
                            `/api/avatar/${user.value.user_id}`,
                        );
                        avatar_url.value = avatar_data.data || '/icon.png';
                    }
                } catch (err: any) {
                    error.value = String(err);
                }
            } else {
                avatar_url.value = '/icon.png';
            }
        },
        { immediate: true },
    );

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
