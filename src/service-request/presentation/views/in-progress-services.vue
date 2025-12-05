<script setup>
/**
 * @file in-progress-services.vue
 * @description This component displays a list of in-progress service requests for a provider, allowing them to assign technicians and complete services.
 * @author Kenyi Ramirez
 */
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const { t } = useI18n();
const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
const authStore = useAuthStore();

/** @type {import('vue').Ref<boolean>} */
const loading = ref(false);
/** @type {import('vue').Ref<string|null>} */
const error = ref(null);
/** @type {import('vue').Ref<Array<object>>} */
const activeRequests = ref([]);
/** @type {import('vue').Ref<Array<object>>} */
const technicians = ref([]);
/** @type {import('vue').Ref<object>} */
const selectedTechnicians = ref({});

/**
 * Computed property for the current provider's ID.
 * @type {import('vue').ComputedRef<number>}
 */
const currentProviderId = computed(() => authStore.currentUserId);

/**
 * Fetches active service requests and available technicians for the current provider.
 * @async
 * @function fetchData
 */
const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [acceptedRes, inProgressRes, techsRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'accepted'),
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'inProgress'),
      // iamApi.http.get('/sites'), // Not implemented yet
      techniciansApi.getTechniciansByProvider(currentProviderId.value)
    ]);

    const context = { technicians: techsRes.data };
    const accepted = ServiceRequestAssembler.toEntitiesFromResponse(acceptedRes.data, context);
    const inProgress = ServiceRequestAssembler.toEntitiesFromResponse(inProgressRes.data, context);

    activeRequests.value = [...accepted, ...inProgress];
    technicians.value = techsRes.data;
  } catch (e) {
    error.value = 'Failed to load data.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

/**
 * Assigns a selected technician to a service request.
 * @param {number} requestId - The ID of the service request.
 * @async
 * @function assignTechnician
 */
const assignTechnician = async (requestId) => {
  const technicianId = selectedTechnicians.value[requestId];
  if (!technicianId) return;
  await serviceRequestApi.sendAssignTechnicianCommand(requestId, technicianId);
  await fetchData();
};

/**
 * Marks a service request as complete.
 * @param {number} requestId - The ID of the service request to complete.
 * @async
 * @function completeService
 */
const completeService = async (requestId) => {
  await serviceRequestApi.sendCompleteRequestCommand(requestId);
  await fetchData();
};

/**
 * Returns the translated status string.
 * @param {string} status - The status to translate.
 * @returns {string} The translated status.
 * @function getStatusTranslation
 */
const getStatusTranslation = (status) => {
  return t(`services.status.${status}`);
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">{{ t('services.in-progress.title') }}</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="activeRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" :header="t('services.in-progress.id')" sortable style="width: 10%"></pv-column>
          <pv-column field="description" :header="t('services.in-progress.description')" style="width: 30%"></pv-column>
          <pv-column field="status" :header="t('services.in-progress.status')" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.status === 'accepted' ? 'warning' : 'info'" :value="getStatusTranslation(data.status)"></pv-tag>
            </template>
          </pv-column>
          <pv-column field="technicianName" :header="t('services.in-progress.assigned-technician')" sortable style="width: 20%">
            <template #body="{ data }">
              {{ data.technicianName || t('services.in-progress.not-assigned') }}
            </template>
          </pv-column>
          <pv-column :header="t('services.in-progress.actions')" style="width: 25%">
            <template #body="{ data }">
              <div v-if="data.status === 'accepted'" class="flex align-items-center">
                <pv-select v-model="selectedTechnicians[data.id]" :options="technicians" optionLabel="name" optionValue="id" :placeholder="t('services.in-progress.assign-technician')" class="mr-2" style="min-width: 150px;"/>
                <pv-button icon="pi pi-user-plus" @click="assignTechnician(data.id)" :disabled="!selectedTechnicians[data.id]"/>
              </div>
              <pv-button v-if="data.status === 'inProgress'" :label="t('services.in-progress.complete')" icon="pi pi-check-circle" class="p-button-success" @click="completeService(data.id)"/>
            </template>
          </pv-column>
          <template #empty>
            {{ t('services.in-progress.no-active-services') }}
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
