<template>
    <v-container class="py-6">
        <h2 class="text-h5 font-weight-bold mb-4">用户关注</h2>

        <!-- 加载状态 -->
        <div v-if="loading" class="d-flex justify-center pa-6">
            <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- 错误提示 -->
        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
        </v-alert>

        <!-- 内容 -->
        <div v-else>
            <v-alert v-if="followings.length === 0" type="info" variant="tonal"> 暂无关注 </v-alert>

            <v-list v-else lines="two" class="rounded-lg elevation-1">
                <FollowListItem
                    v-for="f in followings"
                    :key="f.following_id"
                    :user-id="f.following_id"
                />
            </v-list>

            <!-- 分页 -->
            <div class="d-flex justify-center mt-6">
                <v-pagination v-model="page" :length="maxPages" total-visible="7" color="primary" />
            </div>
        </div>
    </v-container>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue';
    import FollowListItem from '@/components/FollowListItem.vue';

    interface Following {
        following_id: number;
    }

    const route = useRoute();
    const followings = ref<Following[]>([]);
    const page = ref(1);
    const maxPages = ref(1);
    const total = ref(0);

    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchFollowings() {
        loading.value = true;
        error.value = null;
        try {
            const res = await $fetch<{
                success: boolean;
                data: Following[];
                maxPages: number;
                total: number;
            }>('/api/follow/get_following_list/' + route.params.id, {
                query: { page: page.value, pageSize: 10 },
            });

            if (!res.success) {
                throw new Error('请求失败');
            }

            if (page.value > res.maxPages && res.maxPages > 0) {
                page.value = res.maxPages;
                return;
            }

            followings.value = res.data;
            maxPages.value = res.maxPages;
            total.value = res.total;
        } catch (err: any) {
            error.value = err.message || '加载失败';
        } finally {
            loading.value = false;
        }
    }

    onMounted(fetchFollowings);
    watch(page, fetchFollowings);
</script>
