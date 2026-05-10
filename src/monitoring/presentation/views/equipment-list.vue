<script setup>

import { computed, onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const store = useMonitoringStore();
const assetsStore = useAssetsManagementStore();
const { equipments, equipmentsLoaded, errors } = storeToRefs(store);
const { fetchEquipments, createEquipment } = store;
const { sites, sitesLoaded } = storeToRefs(assetsStore);
const { fetchSites } = assetsStore;
const displayNewEquipmentDialog = ref(false);
const serverError = ref(null);

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
    online: false
  };
  serverError.value = null;
  displayNewEquipmentDialog.value = true;
};

const saveNewEquipment = async () => {
  serverError.value = null

  if (!newEquipment.value.name || !newEquipment.value.siteId) {
    alert(t('equipments.new.alert-required-fields'));
    return;
  }

  const sameSerial = equipments.value.find(e =>
      e.serial === newEquipment.value.serial
  )
  if (sameSerial) {
    serverError.value = t('equipments.new.alert-duplicate-serial')
    return
  }

  try {
    await createEquipment(newEquipment.value);
    alert(t('equipments.new.alert-equipment-created'));
    displayNewEquipmentDialog.value = false;
    await fetchEquipments();
  } catch (error) {
    serverError.value = t('equipments.new.alert-create-error')
    console.error('Error creating equipment:', error);
  }
};

const isFormValid = computed(() => {
  return (
      newEquipment.value.siteId !== null &&
      newEquipment.value.model.trim() !== '' &&
      newEquipment.value.type.trim() !== '' &&
      newEquipment.value.serial.trim() !== '' &&
      newEquipment.value.status !== '' &&
      newEquipment.value.online !== null
  );
});

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
          <span>{{ slotProps.data.model }}</span>
        </template>
      </pv-column>

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
                : slotProps.data.status === 'repair'
                  ? 'orange'
                  : '',
              fontWeight: 'bold'
            }"
          >
            {{ slotProps.data.status }}
          </span>
        </template>
      </pv-column>

      <!-- More Information -->
      <pv-column :header="t('sites.list.information')">
        <template #body="{ data }">
          <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: data.id } }">
            <pv-button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="t('sites.detail.view')" />
          </RouterLink>
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
      <div v-if="serverError"
           class="flex align-items-center gap-2 p-3 mb-3 border-round"
           style="background: #fdecea; border: 1px solid #f5c2c7; color: #842029; border-radius: 6px;">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <form @submit.prevent="saveNewEquipment" class="flex flex-column gap-4">
        <div class="formgrid grid row-gap-3">
          <!-- Put Site -->
          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-dropdown
                  id="site-id"
                  v-model="newEquipment.siteId"
                  :options="sites"
                  option-label="name"
                  option-value="id"
                  class="w-full"
                  @change="newEquipment.name = sites.find(s => s.id === newEquipment.siteId)?.name ?? ''"
              />
              <label for="site-id">{{ t('equipments.new.site') }}</label>
            </pv-float-label>
          </div>

          <!-- Create Model -->
          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-input-text id="equipment-model" v-model="newEquipment.model" class="w-full" />
              <label for="equipment-model">{{ t('equipments.new.model') }}</label>
            </pv-float-label>
          </div>

          <!-- Create Type -->
          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-type" v-model="newEquipment.type" class="w-full" />
              <label for="equipment-type">{{ t('equipments.new.type') }}</label>
            </pv-float-label>
          </div>

          <!-- Create Serial -->
          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="equipment-serial" v-model="newEquipment.serial" class="w-full" />
              <label for="equipment-serial">{{ t('equipments.new.serial') }}</label>
            </pv-float-label>
          </div>

          <!-- Put Status -->
          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-dropdown
                  id="equipment-status"
                  v-model="newEquipment.status"
                  :options="[
                      { label: 'Active', value: 'ACTIVE' },
                      { label: 'Maintenance', value: 'MAINTENANCE' },
                      { label: 'Repair', value: 'Repair' },
                      { label: 'Off', value: 'OFF' }]"
                  option-label="label"
                  option-value="value"
                  class="w-full"
              />
              <label for="equipment-status">{{ t('equipments.new.status') }}</label>
            </pv-float-label>
          </div>

          <!-- Put Online -->
          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-dropdown
                  id="equipment-online"
                  v-model="newEquipment.online"
                  :options="[{ label: 'Online', value: true }, { label: 'Offline', value: false }]"
                  option-label="label"
                  option-value="value"
                  class="w-full"
              />
              <label for="equipment-online">{{ t('equipments.new.online') }}</label>
            </pv-float-label>
          </div>
        </div>
      </form>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="displayNewEquipmentDialog = false" class="p-button-text" />
        <pv-button
            :label="t('equipments.new.register')"
            icon="pi pi-check"
            @click="saveNewEquipment"
            :disabled="!isFormValid"
        />
      </template>
    </pv-dialog>

  </section>

</template>

<style scoped>

</style>