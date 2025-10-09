<script setup>

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">
      {{ t('alerts.list.title') }}
    </h1>

    <p>Aquí se mostrarán las alertas del equipo.</p>
  </section>
</template>
