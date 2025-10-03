<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('reports.list.title') }}</h1>

    <div class="flex gap-2">
      <RouterLink :to="{ name: 'report-detail', params: { reportId: '1' } }">
        <pv-button :label="t('reports.detail.title')" />
      </RouterLink>
    </div>
  </section>
</template>
