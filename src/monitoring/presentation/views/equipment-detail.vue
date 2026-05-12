<script setup>

import { useI18n } from 'vue-i18n'
import { onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';
import { useConfirm } from "primevue/useconfirm";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";
import { useRouter } from 'vue-router';

const { t } = useI18n();
const store = useMonitoringStore();
const { equipments, equipmentsLoaded, errors } = storeToRefs(store);
const { fetchEquipments, updateEquipment, deleteEquipment } = store;
const confirm = useConfirm();
const serverError = ref(null);
const displayEditDialog = ref(false);
const selectedEquipment = ref(null);
const router = useRouter();

const editForm = ref({
  id: null,
  name: '',
  model: '',
  type: '',
  serial: '',
  status: '',
  online: false,
  siteId: null
});

onMounted(() => {
  if (!equipmentsLoaded.value) fetchEquipments();
});

const openEditDialog = (equipment) => {
  serverError.value = null;
  editForm.value = { ...equipment };
  displayEditDialog.value = true;
};

const saveEditEquipment = async () => {
  serverError.value = null;



  try {
    await updateEquipment(editForm.value);
    displayEditDialog.value = false;
    await fetchEquipments();
  } catch (error) {
    serverError.value = t('equipments.new.alert-create-error');
    console.error('Error updating equipment:', error);
  }
};

const confirmDelete = (equipment) => {
  if (!equipment.id) return;
  confirm.require({
    message: `¿Eliminar el equipo "${equipment.name}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await deleteEquipment(equipment);
      await fetchEquipments();
    }
  });
};

function showDetails(equipment) {
  selectedEquipment.value = equipment;
}

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

</script>

<template>
  <section class="p-4">
    <pv-confirm-dialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('equipments.detail.title') }}</h1>

      <pv-button
          icon="pi pi-arrow-left"
          :label="t('common.back')"
          text
          severity="secondary"
          @click="router.back()"
      />
    </div>

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
      <pv-column field="siteId" :header="t('equipments.detail.siteId')" sortable >
      </pv-column>

      <!-- Created At -->
      <pv-column field="created" :header="t('equipments.detail.createdAt')">
        <template #body="{ data }">
          {{ formatDate(data.created) }}
        </template>
      </pv-column>

      <!-- Updated At -->
      <pv-column field="updated" :header="t('equipments.detail.updatedAt')">
        <template #body="{ data }">
          {{ formatDate(data.updated) }}
        </template>
      </pv-column>

      <!-- Botton Information -->
      <pv-column :header="t('equipments.controls.info')">
        <template #body="slotProps">
          <pv-button
              :label="t('common.more')"
              icon="pi pi-info-circle"
              iconPos="left"
              outlined
              rounded
              severity="info"
              @click="showDetails(slotProps.data)"
          />
        </template>
      </pv-column>

      <!-- Actions -->
      <pv-column :header="t('sites.detail.actions')">
        <template #body="{ data }">
          <div class="flex gap-2">
            <!-- Botton Edit -->
            <pv-button
                icon="pi pi-pencil"
                text
                rounded
                severity="warning"
                v-tooltip.top="t('common.edit')"
                @click="openEditDialog(data)"
            />

            <!-- Botton Delete -->
            <pv-button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                v-tooltip.top="t('common.delete')"
                @click="confirmDelete(data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <!-- Diálogo edición -->
    <pv-dialog v-model:visible="displayEditDialog" header="Edit Equipment"
               :modal="true" class="p-fluid" style="width: 50vw">

      <div v-if="serverError"
           class="flex align-items-center gap-2 p-3 mb-3 border-round"
           style="background: #fdecea; border: 1px solid #f5c2c7; color: #842029; border-radius: 6px;">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <div class="formgrid grid row-gap-3">
        <!-- Actualizar Model -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.model') }}</label>
          <pv-input-text v-model="editForm.model" class="w-full" disabled />
        </div>

        <!-- Actualizar Type -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.type') }}</label>
          <pv-input-text v-model="editForm.type" class="w-full" disabled />
        </div>

        <!-- Actualizar Serial -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.serial') }}</label>
          <pv-input-text v-model="editForm.serial" class="w-full" disabled />
        </div>

        <!-- Actualizar Status -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.status') }}</label>
          <pv-dropdown v-model="editForm.status"
                       :options="[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Maintenance', value: 'MAINTENANCE' },
            { label: 'Repair', value: 'Repair' },
            { label: 'Off', value: 'OFF' }]"
                       option-label="label" option-value="value" class="w-full" />
        </div>

        <!-- Actualizar Online -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.online') }}</label>
          <pv-dropdown v-model="editForm.online"
                       :options="[{ label: 'Online', value: true }, { label: 'Offline', value: false }]"
                       option-label="label" option-value="value" class="w-full" />
        </div>
      </div>

      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times"
                   class="p-button-text" @click="displayEditDialog = false" />
        <pv-button label="Save" icon="pi pi-check"
                   severity="success" @click="saveEditEquipment" />
      </template>
    </pv-dialog>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <!-- Show details -->
    <div v-if="selectedEquipment" class="flex flex-row justify-content-center gap-6 mt-3">
      <!-- Show Owner -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.name') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.name }}
        </h3>
      </div>

      <!-- Show Online -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.online') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.online }}
        </h3>
      </div>

      <!-- Show Serial -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.detail.serial') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.serial }}
        </h3>
      </div>

      <!-- Show Type -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.new.type') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.type }}
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
