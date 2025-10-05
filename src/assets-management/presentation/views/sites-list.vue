<script setup>

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('sites.list.title') }}</h1>
    <div class="flex gap-2">
      <div class="p-4">

        <pv-data-table
            :value="sites"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Id -->
          <pv-column field="id" :header="t('sites.list.id')" sortable />

          <!-- Name -->
          <pv-column field="name" :header="t('sites.list.name')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Address -->
          <pv-column field="address" :header="t('sites.list.address')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <RouterLink :to="{ name: 'site-detail', params: { siteId: '1' } }">
        <pv-button :label="t('sites.detail.title')" />
      </RouterLink>

    </div>
  </section>
</template>

<style scoped>

</style>
