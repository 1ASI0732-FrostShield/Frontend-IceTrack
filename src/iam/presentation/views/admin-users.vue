<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('admin.users.title') }}</h1>

    <div class="flex gap-2">
      <RouterLink :to="{ name: 'admin-settings' }">
        <pv-button :label="t('admin.settings.title')" />
      </RouterLink>
    </div>
  </section>
</template>
