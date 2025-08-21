<template>
    <v-container>
        <v-row class="d-flex justify-center">
            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title class="headline">{{ $t('login') }}</v-card-title>
                    <v-card-text>
                        <v-form>
                            <v-text-field
                                v-model="email"
                                :label="$t('email')"
                                :rules="[required]"
                                autocomplete="email"
                            />
                            <v-text-field
                                v-model="password"
                                :label="$t('password')"
                                type="password"
                                :rules="[required]"
                                autocomplete="current-password"
                            />
                        </v-form>
                        <v-alert v-if="error != null" type="error">
                            {{ error }}
                        </v-alert>
                    </v-card-text>
                    <v-card-actions class="d-flex justify-end">
                        <v-btn color="primary" @click="login">{{ $t('login') }}</v-btn>
                        <v-btn color="secondary" :to="localePath('/register')">{{
                            $t('register')
                        }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    const localePath = useLocalePath();

    const email = ref<string>('');
    const password = ref<string>('');
    const error = ref<string | null>(null);
    // const router = useRouter()
    const { t } = useI18n();

    const required = (value: string) => !!value || t('fieldIsRequired');

    const login = async () => {
        if (email.value == '' || password.value == '') {
            error.value = t('emailAndPasswordCantBeEmpty');
            return;
        }

        try {
            const response = await $fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.value,
                    password: password.value,
                }),
            });

            if (!response.success) {
                throw { message: response.message, statusCode: 400 };
            }

            if (response.success) {
                await fetchAuthUser();
                navigateTo(localePath('/'));
            } else {
                error.value = response.message;
            }
        } catch (err: unknown) {
            // 由于 err 是 unknown 类型，需要先进行类型断言
            if (typeof err === 'object' && err !== null && 'statusCode' in err) {
                const e = err as { statusCode?: number };
                if (e.statusCode === 400) {
                    error.value = t('checkEmailAndPassword');
                }
            }
        }
    };
</script>

<style scoped>
    .headline {
        font-weight: bold;
    }
</style>
