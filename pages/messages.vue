<template>
    <v-container>
        <v-card>
            <v-tabs v-model="activeTab" bg-color="primary" dark>
                <v-tab :value="'received'">{{ $t('received') }}</v-tab>
                <v-tab :value="'sent'">{{ $t('sent') }}</v-tab>
            </v-tabs>

            <v-card-text>
                <v-data-table :headers="headers" :items="messages" :loading="loading" item-value="id"
                    class="elevation-1">
                    <template #item.created_at="{ item }">
                        {{ new Date(item.created_at).toLocaleString() }}
                    </template>
                </v-data-table>
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-pagination v-model="page" :length="maxPages" total-visible="7"></v-pagination>
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

const headers = [
    { title: t('id'), value: 'message_id' },
    { title: t('sender'), value: 'sender_id' },
    { title: t('receiver'), value: 'receiver_id' },
    { title: t('tweetId'), value: 'tweet_id' },
    { title: t('commentId'), value: 'comment_id' },
    { title: t('content'), value: 'content' },
    { title: t('createdAt'), value: 'created_at' }
]

async function fetchMessages() {
    loading.value = true
    const endpoint =
        activeTab.value === 'received'
            ? `/api/message/get`
            : `/api/message/getSent`

    try {
        const data = <any>await $fetch(endpoint, {
            params: {
                page: page.value,
                pageSize
            }
        })

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

watch([activeTab, page], () => {
    fetchMessages()
})

onMounted(() => {
    fetchMessages()
})
</script>
