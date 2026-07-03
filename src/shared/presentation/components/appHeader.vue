<script setup>

import { useI18n } from '@/i18n.js'
import { useRouter } from 'vue-router'
import { useAuthStore} from "@/iam/application/auth.store.js";

const { locale, t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

function setLang(lang) {
  locale.value = lang
}

function handleSignOut() {
  authStore.logout()
  router.push({ name: 'auth-login' })
}

</script>

<template>
  <header class="topbar">
    <div class="brand" @click="$router.push('/dashboard')" role="button" aria-label="Go to dashboard">
      <i class="pi pi-snowflake"></i>
      <span>{{ t('common.appName') }}</span>
    </div>

    <div class="spacer"></div>

    <div class="actions">

      <!-- Mostrar nombre de usuario y botón de cerrar sesión si está autenticado -->
      <template v-if="authStore.isLoggedIn && authStore.user">
        <!-- Mostramos el rol del usuario -->
        <span class="font-bold text-sm mr-2 text-primary-500">({{ authStore.user.role }})</span>
        <!-- Mostramos el email (username) del usuario -->
        <span class="font-medium text-color-secondary mr-2">{{ authStore.user.email }}</span>

        <pv-button
            icon="pi pi-power-off"
            severity="danger"
            rounded
            text
            aria-label="Logout"
            @click="handleSignOut" />
      </template>

      <pv-avatar icon="pi pi-user" shape="circle" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
  position: sticky;
  top: 0;
  z-index: 100;
  color: var(--app-text);
}
.brand { display:flex; gap:8px; align-items:center; cursor:pointer; font-weight:600; color: var(--app-primary); }
.spacer { flex: 1; }
.actions { display:flex; gap:8px; align-items:center; }
</style>
