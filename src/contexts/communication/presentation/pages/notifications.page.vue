<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('notifications.title') }}</h1>
    <p class="opacity-70">{{ t('notifications.empty') }}</p>
  </section>
</template>
