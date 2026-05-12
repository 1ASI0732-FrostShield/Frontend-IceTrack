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
const serialError = ref(null);

const EQUIPMENT_TYPES = [
  { label: 'Chiller',          value: 'CHILLER' },
  { label: 'Cooling Tower',    value: 'COOLING_TOWER' },
  { label: 'AHU',              value: 'AHU' },
  { label: 'Fan Coil',         value: 'FAN_COIL' },
  { label: 'Condensing Unit',  value: 'CONDENSING_UNIT' },
  { label: 'Heat Exchanger',   value: 'HEAT_EXCHANGER' },
];

const EQUIPMENT_MODELS = [
  { label: 'Carrier 30XA',  value: 'CARRIER_30XA' },
  { label: 'Trane CGAX',    value: 'TRANE_CGAX' },
  { label: 'York YVAA',     value: 'YORK_YVAA' },
  { label: 'Daikin EWAD',   value: 'DAIKIN_EWAD' },
  { label: 'Lennox XC25',   value: 'LENNOX_XC25' },
  { label: 'McQuay AWV',    value: 'MCQUAY_AWV' },
];

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
  serialError.value = null;
  displayNewEquipmentDialog.value = true;
};

const validateSerial = () => {
  const val = newEquipment.value.serial.trim();
  if (val.length === 0) {
    serialError.value = null;
  } else if (val.length < 8) {
    serialError.value = 'El serial debe tener al menos 8 caracteres.';
  } else if (val.length > 12) {
    newEquipment.value.serial = val.slice(0, 12);
    serialError.value = null;
  } else {
    serialError.value = null;
  }
};

const saveNewEquipment = async () => {
  serverError.value = null;

  if (!newEquipment.value.name || !newEquipment.value.siteId) {
    alert(t('equipments.new.alert-required-fields'));
    return;
  }

  const serialLen = newEquipment.value.serial.trim().length;
  if (serialLen < 8 || serialLen > 12) {
    serialError.value = 'El serial debe tener entre 8 y 12 caracteres.';
    return;
  }

  const sameSerial = equipments.value.find(e =>
      e.serial === newEquipment.value.serial
  );
  if (sameSerial) {
    serverError.value = t('equipments.new.alert-duplicate-serial');
    return;
  }

  try {
    await createEquipment(newEquipment.value);
    alert(t('equipments.new.alert-equipment-created'));
    displayNewEquipmentDialog.value = false;
    await fetchEquipments();
  } catch (error) {
    serverError.value = t('equipments.new.alert-create-error');
    console.error('Error creating equipment:', error);
  }
};

const isFormValid = computed(() => {
  const serialLen = newEquipment.value.serial.trim().length;
  return (
      newEquipment.value.siteId !== null &&
      newEquipment.value.model.trim() !== '' &&
      newEquipment.value.type.trim() !== '' &&
      serialLen >= 8 &&
      serialLen <= 12 &&
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
      <pv-column field="name" :header="t('sites.list.name')" />

      <pv-column field="model" :header="t('equipments.list.model')">
        <template #body="slotProps">
          <span>{{ slotProps.data.model }}</span>
        </template>
      </pv-column>

      <pv-column field="status" :header="t('equipments.list.status')">
        <template #body="slotProps">
          <span
              :style="{
              color:
                slotProps.data.status === 'active'   ? 'green'  :
                slotProps.data.status === 'maintenance' ? 'red'  :
                slotProps.data.status === 'repair'    ? 'orange' : '',
              fontWeight: 'bold'
            }"
          >
            {{ slotProps.data.status }}
          </span>
        </template>
      </pv-column>

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

    <!-- Dialog -->
    <pv-dialog
        v-model:visible="displayNewEquipmentDialog"
        :header="t('equipments.new.title')"
        :modal="true"
        class="p-fluid"
        style="width: 50vw"
    >
      <!-- Server error banner -->
      <div v-if="serverError"
           class="flex align-items-center gap-2 p-3 mb-3"
           style="background:#fdecea; border:1px solid #f5c2c7; color:#842029; border-radius:6px;">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <div class="formgrid grid row-gap-3 mt-2">

        <!-- Site -->
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

        <!-- Model → dropdown -->
        <div class="field col-12 md:col-6 mt-4">
          <pv-float-label>
            <pv-dropdown
                id="equipment-model"
                v-model="newEquipment.model"
                :options="EQUIPMENT_MODELS"
                option-label="label"
                option-value="value"
                class="w-full"
            />
            <label for="equipment-model">{{ t('equipments.new.model') }}</label>
          </pv-float-label>
        </div>

        <!-- Type → dropdown -->
        <div class="field col-12 md:col-6">
          <pv-float-label>
            <pv-dropdown
                id="equipment-type"
                v-model="newEquipment.type"
                :options="EQUIPMENT_TYPES"
                option-label="label"
                option-value="value"
                class="w-full"
            />
            <label for="equipment-type">{{ t('equipments.new.type') }}</label>
          </pv-float-label>
        </div>

        <!-- Serial → con placeholder y validación -->
        <div class="field col-12 md:col-6">
          <pv-float-label>
            <pv-input-text
                id="equipment-serial"
                v-model="newEquipment.serial"
                class="w-full"
                :class="{ 'p-invalid': serialError }"
                placeholder="Ej: RF2026A0012"
                maxlength="12"
                @input="validateSerial"
            />
            <label for="equipment-serial">{{ t('equipments.new.serial') }}</label>
          </pv-float-label>
          <small v-if="serialError" style="color: red; font-size: 0.8rem;">
            {{ serialError }}
          </small>
          <small v-else style="color: #888; font-size: 0.8rem;">
            Entre 8 y 12 caracteres. Ej: RF2026A0012, FRIGO-23X89
          </small>
        </div>

        <!-- Status -->
        <div class="field col-12 md:col-6">
          <pv-float-label>
            <pv-dropdown
                id="equipment-status"
                v-model="newEquipment.status"
                :options="[
                  { label: 'Active',      value: 'ACTIVE' },
                  { label: 'Maintenance', value: 'MAINTENANCE' },
                  { label: 'Repair',      value: 'REPAIR' },
                  { label: 'Off',         value: 'OFF' }
                ]"
                option-label="label"
                option-value="value"
                class="w-full"
            />
            <label for="equipment-status">{{ t('equipments.new.status') }}</label>
          </pv-float-label>
        </div>

        <!-- Online -->
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