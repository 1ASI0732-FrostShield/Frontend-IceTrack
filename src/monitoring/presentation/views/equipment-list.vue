<script setup>

import { onMounted, ref } from "vue";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const store = useMonitoringStore();
const assetsStore = useAssetsManagementStore();
const { equipments, equipmentsLoaded, errors, fetchEquipments, createEquipment } = store;
const { sites, sitesLoaded, fetchSites } = assetsStore;

const displayNewEquipmentDialog = ref(false);

const newEquipment = ref({
  name: '',
  model: '',
  type: '',
  serial: '',
  manufacturer: '',
  status: '',
  setPoint: 0,
  siteId: null,
  online: false
});

onMounted(() => {
  if (!equipmentsLoaded.value) fetchEquipments();
  if (!sitesLoaded.value) fetchSites();
});

const openNewEquipmentDialog = () => {
  newEquipment.value = {
    name: '',
    model: '',
    type: '',
    serial: '',
    manufacturer: '',
    status: '',
    setPoint: 0,
    siteId: null,
  };
  displayNewEquipmentDialog.value = true;
};

const saveNewEquipment = async () => {
  if (!newEquipment.value.name || !newEquipment.value.siteId) {
    alert(t('equipments.new.alert-required-fields'));
    return;
  }
  try {
    await createEquipment(newEquipment.value);
    alert(t('equipments.new.alert-equipment-created'));
    displayNewEquipmentDialog.value = false;
    await fetchEquipments();
  } catch (error) {
    alert(t('equipments.new.alert-create-error'));
    console.error('Error creating equipment:', error);
  }
};

</script>

<template>

  <section class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('equipments.list.title') }}</h1>

      <pv-button :label="t('equipments.new.title')" icon="pi pi-plus" severity="success" @click="openNewEquipmentDialog" />
    </div>

    <pv-data-table
        :value="equipments"
        :loading="!equipmentsLoaded"
        striped-rows
        table-style="min-width: 80rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <!-- Name -->
      <pv-column field="name" :header="t('sites.list.name')" />

      <!-- Model -->
      <pv-column field="model" :header="t('equipments.list.model')">
        <template #body="slotProps">
          <span style="font-weight: bold">{{ slotProps.data.model }}</span>
        </template>
      </pv-column>

      <!-- Type -->
      <pv-column field="type" :header="t('equipments.list.type')" />

      <!-- Serial -->
      <pv-column field="serial" :header="t('equipments.list.serial')" />

      <!-- Status -->
      <pv-column field="status" :header="t('equipments.list.status')">
        <template #body="slotProps">
          <span
              :style="{
              color:
                slotProps.data.status === 'active'
                  ? 'green'
                : slotProps.data.status === 'maintenance'
                  ? 'red'
                  : '',
              fontWeight: 'bold'
            }"
          >
            {{ slotProps.data.status }}
          </span>
        </template>
      </pv-column>

      <template #empty>
        {{ t('equipments.list.empty') }}
      </template>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <pv-dialog v-model:visible="displayNewEquipmentDialog" :header="t('equipments.new.title')" :modal="true" class="p-fluid" style="width: 50vw">
      <form @submit.prevent="saveNewEquipment" class="flex flex-column gap-4">
        <div class="formgrid grid row-gap-3">

          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-dropdown id="site-id" v-model="newEquipment.siteId" :options="sites" option-label="name" option-value="id" class="w-full" />
              <label for="site-id">{{ t('equipments.new.site') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-input-text id="equipment-model" v-model="newEquipment.model" class="w-full" />
              <label for="equipment-model">{{ t('equipments.new.model') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-type" v-model="newEquipment.type" class="w-full" />
              <label for="equipment-type">{{ t('equipments.new.type') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-serial" v-model="newEquipment.serial" class="w-full" />
              <label for="equipment-serial">{{ t('equipments.new.serial') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-manufacturer" v-model="newEquipment.manufacturer" class="w-full" />
              <label for="equipment-manufacturer">{{ t('equipments.new.manufacturer') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-dropdown id="equipment-status" v-model="newEquipment.status" :options="[{ label: 'Active', value: 'active' }, { label: 'Maintenance', value: 'maintenance' }]" option-label="label" option-value="value" class="w-full" />
              <label for="equipment-status">{{ t('equipments.new.status') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-number id="equipment-setpoint" v-model="newEquipment.setPoint" class="w-full" />
              <label for="equipment-setpoint">{{ t('equipments.new.setpointC') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-name" v-model="newEquipment.name" class="w-full" required />
              <label for="equipment-name">{{ t('equipments.new.name') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-dropdown id="equipment-online" v-model="newEquipment.online" :options="[{ label: 'Online', value: true }, { label: 'Offline', value: false }]" option-label="label" option-value="value" class="w-full" />
              <label for="equipment-online">{{ t('equipments.new.online') }}</label>
            </pv-float-label>
          </div>
        </div>
      </form>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="displayNewEquipmentDialog = false" class="p-button-text" />
        <pv-button :label="t('equipments.new.register')" icon="pi pi-check" @click="saveNewEquipment" />
      </template>
    </pv-dialog>

  </section>

</template>

<style scoped>

</style>