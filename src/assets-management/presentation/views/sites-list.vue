<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('sites.list.title') }}</h1>

    <div class="flex gap-2">
      <RouterLink :to="{ name: 'site-detail', params: { siteId: '1' } }">
        <pv-button :label="t('sites.detail.title')" />
      </RouterLink>
      <RouterLink :to="{ name: 'equipments' }">
        <pv-button :label="t('equipments.list.title')" />
      </RouterLink>
    </div>
  </section>
</template>
