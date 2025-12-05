<script setup>
/**
 * @file service-request-detail.vue
 * @description This component displays the detailed information of a service request, including its status, priority, description, and a log of interventions.
 * It also allows providers to register new interventions and view equipment details.
 * @author Kenyi Ramirez
 */
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const api = new ServiceRequestsApi();
const iamApi = new IamApi();
const techniciansApi = new TechniciansApi();

/** @type {import('vue').Ref<object|null>} */
const serviceRequest = ref(null);
/** @type {import('vue').Ref<Array<object>>} */
const interventions = ref([]);
/** @type {import('vue').Ref<Array<object>>} */
const technicians = ref([]);
/** @type {import('vue').Ref<object>} */
const newIntervention = ref({
  technicianId: null,
  summary: '',
  startTime: '',
  endTime: '',
  photoUrls: []
});
/** @type {import('vue').Ref<string>} */
const newPhotoUrl = ref('');

/** @type {import('vue').Ref<boolean>} */
const isLoading = ref(false);
/**
 * Computed property to check if the current user is a provider.
 * @type {import('vue').ComputedRef<boolean>}
 */
const isProvider = computed(() => authStore.currentUserRole === 'Provider');
/**
 * Computed property for the service request ID from the route parameters.
 * @type {import('vue').ComputedRef<number>}
 */
const requestId = computed(() => route.params.requestId);

/** @type {import('vue').Ref<boolean>} */
const displayEquipmentDialog = ref(false);
/** @type {import('vue').Ref<object|null>} */
const selectedEquipment = ref(null);

/**
 * Fetches the details of the service request and its interventions.
 * If the user is a provider, it also fetches the available technicians.
 * @async
 * @function fetchRequestDetails
 */
async function fetchRequestDetails() {
  isLoading.value = true;
  try {
    const [requestRes, interventionsRes] = await Promise.all([
      api.getServiceRequestDetailsQuery(requestId.value),
      api.getInterventionsByRequestQuery(requestId.value)
    ]);
    serviceRequest.value = requestRes.data;
    interventions.value = interventionsRes.data;

    if (isProvider.value) {
      const techniciansRes = await techniciansApi.getTechniciansByProvider(authStore.currentUserId);
      technicians.value = techniciansRes.data;
    }
  } catch (error) {
    console.error("Failed to fetch request details:", error);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Opens the equipment details dialog and fetches the equipment information.
 * @async
 * @function openEquipmentDialog
 */
async function openEquipmentDialog() {
  if (!serviceRequest.value) return;
  try {
    const response = await iamApi.http.get(`/equipment/${serviceRequest.value.equipmentId}`);
    selectedEquipment.value = response.data;
    displayEquipmentDialog.value = true;
  } catch (error) {
    console.error("Failed to fetch equipment details:", error);
  }
}

/**
 * Adds a new photo URL to the new intervention form.
 * @function addPhotoUrl
 */
function addPhotoUrl() {
  if (newPhotoUrl.value && !newIntervention.value.photoUrls.includes(newPhotoUrl.value)) {
    newIntervention.value.photoUrls.push(newPhotoUrl.value);
    newPhotoUrl.value = '';
  }
}

/**
 * Registers a new intervention for the current service request.
 * @async
 * @function registerIntervention
 */
async function registerIntervention() {
  if (!newIntervention.value.technicianId || !newIntervention.value.summary) {
    alert('Please select a technician and provide a summary.');
    return;
  }

  const payload = {
    serviceRequestId: parseInt(requestId.value),
    technicianId: newIntervention.value.technicianId,
    summary: newIntervention.value.summary,
    startTime: newIntervention.value.startTime ? new Date(newIntervention.value.startTime).toISOString() : new Date().toISOString(),
    endTime: newIntervention.value.endTime ? new Date(newIntervention.value.endTime).toISOString() : null,
    status: newIntervention.value.endTime ? 'completed' : 'pending',
    photoUrls: newIntervention.value.photoUrls || []
  };

  try {
    await api.sendRecordInterventionCommand(payload);
    newIntervention.value = { technicianId: null, summary: '', startTime: '', endTime: '', photoUrls: [] };
    await fetchRequestDetails();
  } catch (error) {
    console.error("Failed to register intervention:", error);
  }
}

/**
 * Navigates to the detail page of a specific intervention.
 * @param {object} intervention - The intervention object.
 * @function navigateToIntervention
 */
function navigateToIntervention(intervention) {
  router.push({ name: 'intervention-detail', params: { requestId: requestId.value, interventionId: intervention.id } });
}

/**
 * Returns the translated status string, handling different casings.
 * @param {string} status - The status to translate.
 * @returns {string} The translated status.
 * @function getStatusTranslation
 */
const getStatusTranslation = (status) => {
  if (!status) return '';
  const key = Object.keys(t('services.status')).find(k => k.toLowerCase() === status.toLowerCase());
  return key ? t(`services.status.${key}`) : status;
};


onMounted(fetchRequestDetails);
</script>

<template>
  <div class="p-4">
    <router-view v-if="route.name === 'intervention-detail'"></router-view>
    <div v-else>
      <pv-card v-if="isLoading">
        <template #content><p>{{ t('common.loading') }}</p></template>
      </pv-card>

      <div v-else-if="serviceRequest">
        <h1 class="text-3xl font-bold mb-4">{{ t('services.requests.detail') }} #{{ serviceRequest.id }}</h1>

        <!-- Request Details -->
        <pv-card class="mb-4">
          <template #title>{{ t('services.detail.title') }}</template>
          <template #content>
            <div class="grid">
              <div class="col-12 md:col-6">
                <p><strong>{{ t('common.status.title') }}:</strong> {{ getStatusTranslation(serviceRequest.status) }}</p>
                <p><strong>{{ t('services.requests.priority') }}:</strong> {{ serviceRequest.priority }}</p>
                <p><strong>{{ t('services.detail.description') }}</strong> {{ serviceRequest.description }}</p>
              </div>
              <div class="col-12 md:col-6">
                <p><strong>{{ t('services.detail.site-id') }}</strong> {{ serviceRequest.siteId }}</p>
                <p><strong>{{ t('services.detail.equipment-id') }}</strong> {{ serviceRequest.equipmentId }}</p>
                <p><strong>{{ t('services.detail.created-at') }}</strong> {{ new Date(serviceRequest.createdAt).toLocaleString() }}</p>
              </div>
            </div>
            <div class="mt-4">
              <pv-button :label="t('services.detail.view-equipment-details')" icon="pi pi-server" @click="openEquipmentDialog" />
            </div>
          </template>
        </pv-card>

        <!-- Interventions History -->
        <pv-card class="mb-4">
          <template #title>{{ t('services.detail.interventions-log') }}</template>
          <template #content>
            <pv-timeline :value="interventions" align="alternate" class="customized-timeline">
              <template #marker="slotProps">
                <span class="custom-marker shadow-2" :style="{backgroundColor: slotProps.item.status === 'Completed' ? 'var(--p-primary-color)' : 'var(--p-surface-400)'}">
                  <i :class="slotProps.item.status === 'Completed' ? 'pi pi-check' : 'pi pi-clock'"></i>
                </span>
              </template>
              <template #content="slotProps">
                <pv-card class="mt-3 cursor-pointer hover:shadow-lg" @click="navigateToIntervention(slotProps.item)">
                  <template #title>
                    {{ getStatusTranslation(slotProps.item.status) }} - {{ new Date(slotProps.item.startTime).toLocaleDateString() }}
                  </template>
                  <template #subtitle>
                    {{ t('services.detail.technician-id') }} {{ slotProps.item.technicianId }}
                  </template>
                  <template #content>
                    <p class="line-clamp-2">{{ slotProps.item.summary }}</p>
                    <pv-button :label="t('services.detail.view-details')" icon="pi pi-arrow-right" text class="p-button-sm mt-2" />
                  </template>
                </pv-card>
              </template>
            </pv-timeline>
          </template>
        </pv-card>

        <!-- Register New Intervention (Provider only) -->
        <pv-card v-if="isProvider">
          <template #title>{{ t('services.detail.register-intervention') }}</template>
          <template #content>
            <form @submit.prevent="registerIntervention" class="flex flex-column gap-4">
              <div class="p-fluid">
                <label for="technician">{{ t('services.detail.select-technician') }}</label>
                <pv-dropdown id="technician" v-model="newIntervention.technicianId" :options="technicians" optionLabel="name" optionValue="id" :placeholder="t('services.detail.select-technician')" />
              </div>
              <div class="p-fluid">
                <label for="summary">{{ t('services.detail.work-summary') }}</label>
                <pv-textarea id="summary" v-model="newIntervention.summary" rows="3" required />
              </div>
              <div class="grid formgrid">
                <div class="col-12 md:col-6">
                  <label for="startTime">{{ t('services.detail.start-time') }}</label>
                  <pv-calendar id="startTime" v-model="newIntervention.startTime" showTime hourFormat="24" />
                </div>
                <div class="col-12 md:col-6">
                  <label for="endTime">{{ t('services.detail.end-time') }}</label>
                  <pv-calendar id="endTime" v-model="newIntervention.endTime" showTime hourFormat="24" />
                </div>
              </div>
              <div class="p-fluid">
                <label for="photoUrl">{{ t('services.detail.add-photo-url') }}</label>
                <div class="p-inputgroup">
                  <pv-input-text id="photoUrl" v-model="newPhotoUrl" placeholder="https://example.com/photo.jpg" />
                  <pv-button icon="pi pi-plus" class="p-button-secondary" @click="addPhotoUrl" type="button" />
                </div>
                <div v-if="newIntervention.photoUrls && newIntervention.photoUrls.length" class="mt-2 flex flex-wrap gap-2">
                  <img v-for="url in newIntervention.photoUrls" :key="url" :src="url" class="w-4rem h-4rem shadow-1 border-round"/>
                </div>
              </div>
              <pv-button type="submit" :label="t('services.detail.register')" />
            </form>
          </template>
        </pv-card>

      </div>
      <div v-else>
        <p>{{ t('services.detail.not-found') }}</p>
      </div>
    </div>

    <!-- Equipment Details Dialog -->
    <pv-dialog v-model:visible="displayEquipmentDialog" :header="t('services.detail.equipment-details')" :modal="true" class="p-fluid" style="width: 50vw">
      <div v-if="selectedEquipment">
        <div class="grid">
          <div class="col-6"><strong>{{ t('services.detail.name') }}</strong> {{ selectedEquipment.name }}</div>
          <div class="col-6"><strong>{{ t('services.detail.model') }}</strong> {{ selectedEquipment.model }}</div>
          <div class="col-6"><strong>{{ t('services.detail.serial') }}</strong> {{ selectedEquipment.serial }}</div>
          <div class="col-6"><strong>{{ t('services.detail.type') }}</strong> {{ selectedEquipment.type }}</div>
          <div class="col-6"><strong>{{ t('common.status.title') }}:</strong> <pv-tag :value="getStatusTranslation(selectedEquipment.status)" /></div>
          <div class="col-6"><strong>{{ t('services.detail.installed') }}</strong> {{ new Date(selectedEquipment.installedAt).toLocaleDateString() }}</div>
        </div>
      </div>
      <template #footer>
        <pv-button :label="t('services.detail.close')" icon="pi pi-times" @click="displayEquipmentDialog = false" class="p-button-text"/>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.custom-marker {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 50%;
  z-index: 1;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
