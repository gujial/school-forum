<template>
    <v-container>
        <v-card>
            <v-tabs v-model="activeTab" bg-color="primary" dark>
                <v-tab :value="'received'">{{ $t('received') }}</v-tab>
                <v-tab :value="'sent'">{{ $t('sent') }}</v-tab>
            </v-tabs>

            <template #text>
                <v-text-field
v-model="search" :label="$t('searchIdContentTime')" prepend-inner-icon="mdi-magnify"
                    variant="outlined" hide-details single-line/>
            </template>
            <v-card-text>
                <v-data-table
:headers="headers" :items="messages" :loading="loading" item-value="message_id" :search="search"
                    class="elevation-1">
                    <template #item.created_at="{ item }">
                        {{ new Date(item.created_at).toLocaleString() }}
                    </template>

                    <template #item.sender="{ item }">
                        <v-btn flat :to="`/profile/${item.sender_id}`">{{ usernames[item.sender_id] || 'Loading...' }}</v-btn>
                    </template>

                    <template #item.receiver="{ item }">
                        <v-btn flat :to="`/profile/${item.receiver_id}`">{{ usernames[item.receiver_id] || 'Loading...' }}</v-btn>
                    </template>

                    <template #item.tweet_id="{ item }">
                        <v-btn v-if="item.tweet_id" :to="`/detail/${item.tweet_id}?from=${route.path}`">{{ item.tweet_id }}</v-btn>
                        <span v-else>-</span>
                    </template>

                    <template #item.comment_id="{ item }">
                        <v-btn v-if="item.comment_id" :to="`/detail/${item.tweet_id}#comment-${item.comment_id}`" text>{{ item.comment_id }}</v-btn>
                        <span v-else>-</span>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-icon color="medium-emphasis" icon="mdi-delete" size="small" @click="deleteMessage(item.message_id)"/>
                        </div>
                    </template>
                </v-data-table>
                <v-btn
class="me-2" prepend-icon="mdi-delete" rounded="lg" color="red"
                    :text="$t('deleteAllMessages')" @click="deleteAllMessages"/>
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-pagination v-model="page" :length="maxPages" total-visible="7"/>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeTab = ref<'received' | 'sent'>('received')
const page = ref(1)
const pageSize = 20
const maxPages = ref(1)
const messages = ref<any[]>([])
const loading = ref(false)
const usernames = ref<Record<number, string>>({})
const search = ref('')
const currentUser = useAuthUser()
const localePath = useLocalePath()
const route = useRoute()

const headers = [
    { title: t('sender'), value: 'sender', sortable: true },
    { title: t('receiver'), value: 'receiver', sortable: true },
    { title: t('tweetId'), value: 'tweet_id', sortable: true },
    { title: t('commentId'), value: 'comment_id', sortable: true },
    { title: t('content'), value: 'content', sortable: true },
    { title: t('createdAt'), value: 'created_at', sortable: true },
    { title: t('actions'), value: 'actions', sortable: false }
]

async function fetchMessages() {
    loading.value = true
    const endpoint =
        activeTab.value === 'received'
            ? `/api/message/get`
            : `/api/message/getSent`

    try {
        const data = await $fetch(endpoint, {
            params: {
                page: page.value,
                pageSize
            }
        }) as any

        if (data.success) {
            messages.value = data.data
            maxPages.value = data.maxPages
        } else {
            messages.value = []
            maxPages.value = 1
        }

    } catch (error) {
        console.error('Error fetching messages:', error)
        messages.value = []
        maxPages.value = 1
        loading.value = false
        return
    }
    loading.value = false
}

async function loadUsername(id: number) {
    if (usernames.value[id]) return
    try {
        const { user } = await $fetch(`/api/user/${id}`) as any
        usernames.value[id] = user.username || 'Unknown User'
    } catch {
        usernames.value[id] = 'Unknown User'
    }
}

const deleteAllMessages = async () => {
    try {
        const ep = activeTab.value === 'received'
            ? '/api/message/deleteAllReceive'
            : '/api/message/deleteAllSend'
        await $fetch(ep, { method: 'DELETE' })
        messages.value = []
        maxPages.value = 1
    } catch (error) {
        console.error('Error deleting messages:', error)
    }
}

const deleteMessage = async (messageId: number) => {
    try {
        await $fetch(`/api/message/${messageId}`, { method: 'DELETE' })
        fetchMessages()
    } catch (error) {
        console.error('Error deleting message:', error)
    }
}

watch([activeTab, page], () => {
    fetchMessages()
})

watch(messages, (msgs) => {
    msgs.forEach(msg => {
        loadUsername(msg.sender_id)
        loadUsername(msg.receiver_id)
    })
})

onMounted(() => {
    if (currentUser.value && currentUser.value.user_id === -1) {
        navigateTo(localePath('/login'))
    }
    fetchMessages()
})
</script>
