<script setup>
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
function setLang(lang) { locale.value = lang }
</script>

<template>
  <header class="topbar">
    <div class="brand" @click="$router.push('/dashboard')" role="button" aria-label="Go to dashboard">
      <i class="pi pi-snowflake"></i>
      <span>{{ t('common.appName') }}</span>
    </div>

    <div class="spacer"></div>

    <div class="actions">
      <pv-button text @click="setLang('es')" label="ES" />
      <pv-button text @click="setLang('en')" label="EN" />
      <pv-divider layout="vertical" />
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
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  position: sticky;
  top: 0;
  z-index: 100;
}
.brand { display:flex; gap:8px; align-items:center; cursor:pointer; font-weight:600; }
.spacer { flex: 1; }
.actions { display:flex; gap:8px; align-items:center; }
</style>
