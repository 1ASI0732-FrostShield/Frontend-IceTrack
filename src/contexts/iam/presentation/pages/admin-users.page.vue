<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('admin.users.title') }}</h1>

    <!-- Navegación dentro del contexto IAM -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'admin-settings' }">
        <Button :label="t('admin.settings.title')" />
      </RouterLink>
    </div>
  </section>
</template>
