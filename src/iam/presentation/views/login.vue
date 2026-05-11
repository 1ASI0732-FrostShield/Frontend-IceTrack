<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/iam/application/auth.store.js'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  authStore.errors = []

  try {
    const success = await authStore.login(username.value, password.value)

    if (success) {
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-content-center align-items-center min-h-screen surface-ground">
    <pv-card class="w-full max-w-25rem">

      <!-- Sign in -->
      <template #title>
        <span class="text-2xl font-bold">
          {{ t('auth.login.title') }}
        </span>
      </template>

      <template #content>
        <form @submit.prevent="handleLogin" class="p-fluid">

          <!-- Muestra los errores del store -->
          <div v-if="authStore.errors.length" class="mb-3">
            <p v-for="(error, index) in authStore.errors" :key="index" class="text-red-500 text-sm p-2 bg-red-100 rounded">
              <i class="pi pi-times-circle mr-2"></i>{{ error.message }}
            </p>
          </div>

          <!-- Username -->
          <div class="field mb-4">
            <label for="username" class="block mb-2 font-medium">
              {{ t('auth.login.username') }}
            </label>
            <pv-input-text
                id="username"
                type="text"
                v-model="username"
                class="w-full"
                required
            />
          </div>

          <!-- Password -->
          <div class="field mb-4">
            <label for="password" class="block mb-2 font-medium">
              {{ t('auth.login.password') }}
            </label>
            <pv-input-text
                id="password"
                type="password"
                v-model="password"
                class="w-full"
                required
            />
          </div>

          <pv-button
              type="submit"
              :label="t('auth.login.cta')"
              :loading="loading" />

          <div class="text-center mt-3">
            <router-link :to="{ name: 'auth-register' }" class="text-primary-500 hover:underline text-sm">
              {{ t('auth.login.dontHaveAccount') }}
            </router-link>
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>