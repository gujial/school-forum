<template>
    <v-container>
        <v-card>
            <v-tabs v-model="activeTab" bg-color="primary" dark>
                <v-tab :value="'received'">{{ $t('received') }}</v-tab>
                <v-tab :value="'sent'">{{ $t('sent') }}</v-tab>
            </v-tabs>

            <template #text>
                <v-text-field
                    v-model="search"
                    :label="$t('searchIdContentTime')"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    hide-details
                    single-line
                />
            </template>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="messages"
                    :loading="loading"
                    item-value="message_id"
                    :search="search"
                    class="elevation-1"
                >
                    <template #item.created_at="{ item }">
                        {{ new Date(item.created_at || '').toLocaleString() }}
                    </template>

                    <template #item.sender="{ item }">
                        <v-btn flat :to="`/profile/${item.sender_id}`">{{
                            usernames[item.sender_id] || 'Loading...'
                        }}</v-btn>
                    </template>

                    <template #item.receiver="{ item }">
                        <v-btn flat :to="`/profile/${item.receiver_id}`">{{
                            usernames[item.receiver_id] || 'Loading...'
                        }}</v-btn>
                    </template>

                    <template #item.tweet_id="{ item }">
                        <v-btn
                            v-if="item.tweet_id"
                            :to="`/detail/${item.tweet_id}?from=${route.path}`"
                            >{{ item.tweet_id }}</v-btn
                        >
                        <span v-else>-</span>
                    </template>

                    <template #item.comment_id="{ item }">
                        <v-btn
                            v-if="item.comment_id"
                            :to="`/detail/${item.tweet_id}#comment-${item.comment_id}`"
                            text
                            >{{ item.comment_id }}</v-btn
                        >
                        <span v-else>-</span>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-icon
                                color="medium-emphasis"
                                icon="mdi-delete"
                                size="small"
                                @click="deleteMessage(item.message_id)"
                            />
                        </div>
                    </template>
                </v-data-table>
                <v-btn
                    class="me-2"
                    prepend-icon="mdi-delete"
                    rounded="lg"
                    color="red"
                    :text="$t('deleteAllMessages')"
                    @click="deleteAllMessages"
                />
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-pagination v-model="page" :length="maxPages" total-visible="7" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted, type Ref } from 'vue';
    import { useI18n } from 'vue-i18n';
    import type { Message, User, MessageResponse } from '~/types/models';

    const { t } = useI18n();

    const activeTab: Ref<'received' | 'sent'> = ref('received');
    const page: Ref<number> = ref(1);
    const pageSize: number = 20;
    const maxPages: Ref<number> = ref(1);
    const messages: Ref<Message[]> = ref([]);
    const loading: Ref<boolean> = ref(false);
    const usernames: Ref<Record<number, string>> = ref({});
    const search: Ref<string> = ref('');

    const currentUser = useAuthUser();
    const localePath: (_path: string) => string = useLocalePath();
    const route = useRoute();

    interface TableHeader {
        title: string;
        value: string;
        sortable?: boolean;
    }

    const headers: TableHeader[] = [
        { title: t('sender'), value: 'sender', sortable: true },
        { title: t('receiver'), value: 'receiver', sortable: true },
        { title: t('tweetId'), value: 'tweet_id', sortable: true },
        { title: t('commentId'), value: 'comment_id', sortable: true },
        { title: t('content'), value: 'content', sortable: true },
        { title: t('createdAt'), value: 'created_at', sortable: true },
        { title: t('actions'), value: 'actions', sortable: false },
    ];

    async function fetchMessages(): Promise<void> {
        loading.value = true;
        const endpoint =
            activeTab.value === 'received' ? `/api/message/get` : `/api/message/getSent`;

        try {
            const data = await $fetch<MessageResponse>(endpoint, {
                params: {
                    page: page.value,
                    pageSize,
                },
            });
            if (data.success) {
                messages.value = Array.isArray(data.data) ? data.data : [];
                maxPages.value = data.maxPages || 1;
            } else {
                messages.value = [];
                maxPages.value = 1;
            }
        } catch (error: unknown) {
            console.error('Error fetching messages:', error);
            messages.value = [];
            maxPages.value = 1;
        } finally {
            loading.value = false;
        }
    }

    async function loadUsername(id: number): Promise<void> {
        if (usernames.value[id]) return;
        try {
            const { user } = await $fetch<{ user: User }>(`/api/user/${id}`);
            usernames.value[id] = user.username || 'Unknown User';
        } catch {
            usernames.value[id] = 'Unknown User';
        }
    }

    const deleteAllMessages = async (): Promise<void> => {
        try {
            const ep =
                activeTab.value === 'received'
                    ? '/api/message/deleteAllReceive'
                    : '/api/message/deleteAllSend';
            await $fetch(ep, { method: 'DELETE' });
            messages.value = [];
            maxPages.value = 1;
        } catch (error: unknown) {
            console.error('Error deleting messages:', error);
        }
    };

    const deleteMessage = async (messageId: number): Promise<void> => {
        try {
            await $fetch(`/api/message/${messageId}`, { method: 'DELETE' });
            fetchMessages();
        } catch (error: unknown) {
            console.error('Error deleting message:', error);
        }
    };

    // 监听 tab 和分页变化
    watch([activeTab, page], () => {
        fetchMessages();
    });

    // 监听 messages 加载用户名
    watch(messages, (msgs: Message[]) => {
        msgs.forEach((msg) => {
            loadUsername(msg.sender_id);
            loadUsername(msg.receiver_id);
        });
    });

    // 生命周期
    onMounted(() => {
        if (currentUser.value && currentUser.value.user_id === -1) {
            navigateTo(localePath('/login'));
        }
        fetchMessages();
    });
</script>
