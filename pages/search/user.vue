<template>
    <v-container>
        <!-- 搜索框 -->
        <v-text-field
            v-model="search"
            :label="$t('searchUser')"
            prepend-inner-icon="mdi-magnify"
            clearable
            class="mb-4"
            @keyup.enter="fetchUsers"
        />

        <!-- 用户表格 -->
        <v-data-table
            v-model:page="page"
            :headers="headers"
            :items="users"
            :items-per-page="pageSize"
            :loading="loading"
            :server-items-length="totalUsers"
            class="elevation-1"
        >
            <template #item.created_at="{ item }">
                {{ new Date(item.created_at || '').toLocaleString() }}
            </template>

            <template #item.actions="{ item }">
                <v-btn flat color="primary" :to="localePath(`/profile/${item.user_id}`)">
                    {{ $t('profile') }}
                </v-btn>
            </template>
        </v-data-table>

        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
    </v-container>
</template>

<script setup lang="ts">
    import type { Ref } from 'vue';
    import { ref, watch, onMounted } from 'vue';
    import { useI18n } from 'vue-i18n';
    import type { User, UserListResponse } from '~/types/models';

    const { t } = useI18n();
    const localePath: (_path: string) => string = useLocalePath();

    interface TableHeader {
        title: string;
        key: string;
        sortable?: boolean;
    }

    const headers: TableHeader[] = [
        { title: t('id'), key: 'user_id' },
        { title: t('username'), key: 'username' },
        { title: t('email'), key: 'email' },
        { title: t('createdAt'), key: 'created_at' },
        { title: t('actions'), key: 'actions' },
    ];

    // 用户数据
    const users: Ref<User[]> = ref([]);
    const totalUsers: Ref<number> = ref(0);
    const page: Ref<number> = ref(1);
    const pageSize: number = 20;
    const search: Ref<string> = ref('');
    const loading: Ref<boolean> = ref(false);

    // 错误信息
    const error: Ref<string | null> = ref(null);

    // 获取用户列表
    async function fetchUsers(): Promise<void> {
        loading.value = true;
        try {
            const res = await $fetch<UserListResponse>('/api/user/list', {
                method: 'GET',
                query: {
                    page: page.value,
                    pageSize,
                    keyword: search.value,
                },
            });

            if (res.success) {
                users.value = res.data || [];
                totalUsers.value = res.maxPages * pageSize;
            } else {
                users.value = [];
                totalUsers.value = 0;
                error.value = res.message || 'Failed to fetch users';
            }
        } catch (err: any) {
            console.error(err);
            error.value = err?.message || 'Error fetching users';
        } finally {
            loading.value = false;
        }
    }

    // 生命周期
    onMounted(fetchUsers);

    // 搜索防抖
    let searchTimeout: ReturnType<typeof setTimeout>;
    watch(search, () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            page.value = 1;
            fetchUsers();
        }, 500);
    });

    // 自动清理错误信息
    watch(error, () => {
        if (error.value) {
            setTimeout(() => {
                error.value = null;
            }, 2000);
        }
    });
</script>
