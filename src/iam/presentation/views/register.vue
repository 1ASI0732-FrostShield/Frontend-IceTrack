<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/iam/application/auth.store.js'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const username = ref('')
const password = ref('')
const role = ref(0)
const loading = ref(false)
const errors = ref([])
const registrationSuccess = ref(false)

const roleOptions = [
  { label: t('auth.register.roles.owner'), value: 0, description: t('auth.register.roles.ownerDesc') },
  { label: t('auth.register.roles.provider'), value: 1, description: t('auth.register.roles.providerDesc') }
]

async function handleRegister() {
  errors.value = []
  registrationSuccess.value = false
  authStore.errors = []

  if (!name.value || !username.value || !password.value) {
    errors.value.push({ message: t('validation.required', { field: t('common.all') }) })
    return
  }

  loading.value = true
  try {
    const success = await authStore.register({
      name: name.value,
      username: username.value,
      password: password.value,
      role: role.value
    })

    if (success) {
      registrationSuccess.value = true
      setTimeout(() => {
        router.push({ name: 'auth-login' })
      }, 1500)
    } else {
      errors.value = authStore.errors.map(e => e)
    }

  } catch (error) {
    errors.value.push({ message: t('errors.occurred') });
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-content-center align-items-center min-h-screen surface-ground">
    <pv-card class="w-full max-w-28rem">

      <!-- Create account -->
      <template #title>
        <span class="text-2xl font-bold">
          {{ t('auth.register.title') }}
        </span>
      </template>

      <template #content>
        <form @submit.prevent="handleRegister" class="p-fluid">

          <!-- Muestra los errores -->
          <div v-if="errors.length || authStore.errors.length" class="mb-3">
            <p v-for="(error, index) in (errors.length ? errors : authStore.errors)" :key="index" class="text-red-500 text-sm p-2 bg-red-100 rounded">
              <i class="pi pi-times-circle mr-2"></i>{{ error.message }}
            </p>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="registrationSuccess" class="mb-3">
            <div class="text-green-700 text-base p-3 bg-green-100 rounded border-1 border-green-300">
              <i class="pi pi-check-circle mr-2"></i>{{ t('auth.register.success') }}
            </div>
          </div>

          <!-- Selección de Rol -->
          <div class="field mb-4">
            <label class="font-medium text-lg mb-2">{{ t('auth.register.selectRole') }}</label>
            <div class="flex flex-col gap-3 p-3 border border-surface-300 rounded-lg">
              <div v-for="option in roleOptions" :key="option.value" class="flex align-items-center">
                <pv-radio-button
                    :id="`role-${option.value}`"
                    v-model="role"
                    :value="option.value"
                    name="role"
                    class="mr-2"
                    :disabled="loading || registrationSuccess"
                />
                <label :for="`role-${option.value}`" class="font-semibold cursor-pointer">
                  {{ option.label }}
                  <span class="block text-sm text-color-secondary font-normal">{{ option.description }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="field mb-4">
            <label for="name" class="block mb-2 font-medium">
              {{ t('admin.users.firstName') }}
            </label>
            <pv-input-text
                id="name"
                v-model="name"
                class="w-full"
                required
                :disabled="loading || registrationSuccess"
            />
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
                :disabled="loading || registrationSuccess"
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
                :disabled="loading || registrationSuccess"
            />
          </div>

          <pv-button
              type="submit"
              :label="t('auth.register.cta')"
              :loading="loading"
              :disabled="loading || registrationSuccess"
          />

          <div class="text-center mt-3">
            <router-link :to="{ name: 'auth-login' }" class="text-primary-500 hover:underline text-sm">
              {{ t('auth.register.alreadyHaveAccount') }}
            </router-link>
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>