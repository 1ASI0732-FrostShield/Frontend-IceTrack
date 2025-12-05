<script setup>

import {onMounted} from "vue";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import {useI18n} from "vue-i18n";

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
    <h1 class="text-2xl font-semibold mb-2">{{ t('sites.list.title') }}</h1>
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

          <!-- Name -->
          <pv-column field="name" :header="t('sites.list.name')" />

          <!-- Address -->
          <pv-column field="address" :header="t('sites.list.address')"/>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
          {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>

      </div>

      <RouterLink :to="{ name: 'site-detail', params: { siteId: '1' } }">
        <pv-button :label="t('sites.detail.title')" />
      </RouterLink>

    </div>

  </section>
</template>

<style scoped>

</style>
