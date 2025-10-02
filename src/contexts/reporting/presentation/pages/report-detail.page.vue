<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('reports.detail.title') }}</h1>
    <p class="text-sm opacity-70">reportId: {{ route.params.reportId }}</p>
  </section>
</template>
