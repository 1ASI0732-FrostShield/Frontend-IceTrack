<script setup>

import { useI18n } from 'vue-i18n'
import {onMounted, ref} from "vue";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";

const { t } = useI18n();
const store = useMonitoringStore();
const { equipments, equipmentsLoaded, errors, fetchEquipments } = store;

onMounted(() => {
  if (!equipmentsLoaded) fetchEquipments();
  console.log(equipments);
});

const selectedEquipment = ref(null);

function showDetails(equipment) {
  selectedEquipment.value = equipment;
}

const isOn = ref(true);
function togglePower() {
  isOn.value = !isOn.value;
}

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('equipments.detail.title') }}</h1>

    <div class="flex gap-2">
      <div class="p-4">

        <!-- Table -->
        <pv-data-table
            :value="equipments"
            :loading="!equipmentsLoaded"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Id -->
          <pv-column field="id" :header="t('equipments.detail.siteId')" sortable >
          </pv-column>

          <!-- Installed At -->
          <pv-column field="installed" :header="t('equipments.detail.installedAt')" >
          </pv-column>

          <!-- Last Seen At -->
          <pv-column field="lastSeen" :header="t('equipments.detail.lastSeenAt')" >
          </pv-column>

          <!-- Created At -->
          <pv-column field="created" :header="t('equipments.detail.createdAt')" >
          </pv-column>

          <!-- Updated At -->
          <pv-column field="updated" :header="t('equipments.detail.updatedAt')" >
          </pv-column>

          <!-- Botton Alerts -->
          <pv-column :header="t('equipments.controls.info')">
            <template #body="slotProps">

              <pv-button
                  :label="t('equipments.controls.more')"
                  icon="pi pi-info-circle"
                  iconPos="left"
                  class="p-button-outlined p-button-rounded custom-alert-btn"
                  @click="showDetails(slotProps.data)"
              />

            </template>
          </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
          {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
      </div>

      <RouterLink :to="{ name: 'equipments' }">
        <pv-button :label="t('equipments.list.title')" />
      </RouterLink>
    </div>

    <!-- Show details -->
    <div v-if="selectedEquipment" class="grid gap-6 mt-3">
      <div class="p-6 border shadow bg-gray-50 text-center">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.setpointC') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.setpointC }} °C
        </h3>
      </div>

      <div class="p-6 border shadow bg-gray-50 text-center">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.name') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.name }}
        </h3>
      </div>

      <div class="p-6 border shadow bg-gray-50 text-center">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.manufacturer') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.manufacturer }}
        </h3>
      </div>

      <div class="p-6 border shadow bg-gray-50 text-center">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.online') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.online }}
        </h3>
      </div>
    </div>


  </section>
</template>

<style scoped>

.custom-alert-btn {
  border-color: #2563eb;
  color: #2563eb;
  transition: all 0.3s;
}
.custom-alert-btn:hover {
  background-color: #ebf4ff;
}

</style>
