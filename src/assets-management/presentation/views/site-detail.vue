<script setup>

import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";

const {t} = useI18n();
const store = useAssetsManagementStore();
const { sites, sitesLoaded, errors, fetchSites } = store;

onMounted(() => {
  if (!sitesLoaded) fetchSites();
  console.log(sites);
});

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('sites.detail.title') }}</h1>

    <div class="flex gap-2">
      <div class="p-4">

        <pv-data-table
            :value="sites"
            :loading="!sitesLoaded"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Id -->
          <pv-column field="tenantId" :header="t('sites.list.id')" sortable />

          <!-- Contact Name -->
          <pv-column field="contactName" :header="t('sites.detail.contactName')">
          </pv-column>

          <!-- Contact Phone -->
          <pv-column field="contactPhone" :header="t('sites.detail.contactPhone')">
            <template #body="slotProps">
              <span
                  :style="{
                  fontWeight: 'bold'
                }"
              >
                {{ slotProps.data.contactPhone }}
              </span>
            </template>
          </pv-column>

          <!-- Created At -->
          <pv-column field="createdAt" :header="t('sites.detail.createdAt')">
          </pv-column>

          <!-- Updated At -->
          <pv-column field="updatedAt" :header="t('sites.detail.updatedAt')">
          </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
          {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
      </div>

      <RouterLink :to="{ name: 'sites' }">
        <pv-button :label="t('sites.list.title')" />
      </RouterLink>

    </div>

  </section>
</template>

<style scoped>

</style>
