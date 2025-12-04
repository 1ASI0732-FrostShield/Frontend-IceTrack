<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { IamApi } from '@/iam/infrastructure/iam.api.js';
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const api = new ServiceRequestsApi();
const iamApi = new IamApi();
const techniciansApi = new TechniciansApi();

const serviceRequest = ref(null);
const interventions = ref([]);
const technicians = ref([]);
const newIntervention = ref({
  technicianId: null,
  summary: '',
  startTime: '',
  endTime: '',
  photoUrls: []
});
const newPhotoUrl = ref('');

const isLoading = ref(false);
const isProvider = computed(() => authStore.currentUserRole === 'Provider');
const requestId = computed(() => route.params.requestId);

const displayEquipmentDialog = ref(false);
const selectedEquipment = ref(null);

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

function addPhotoUrl() {
  if (newPhotoUrl.value && !newIntervention.value.photoUrls.includes(newPhotoUrl.value)) {
    newIntervention.value.photoUrls.push(newPhotoUrl.value);
    newPhotoUrl.value = '';
  }
}

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
    status: newIntervention.value.endTime ? 'Completed' : 'Pending',
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

function navigateToIntervention(intervention) {
  router.push({ name: 'intervention-detail', params: { requestId: requestId.value, interventionId: intervention.id } });
}

onMounted(fetchRequestDetails);
</script>

<template>
  <div class="p-4">
    <router-view v-if="route.name === 'intervention-detail'"></router-view>
    <div v-else>
      <pv-card v-if="isLoading">
        <template #content><p>Loading...</p></template>
      </pv-card>

      <div v-else-if="serviceRequest">
        <h1 class="text-3xl font-bold mb-4">{{ t('services.requests.detail') }} #{{ serviceRequest.id }}</h1>

        <!-- Request Details -->
        <pv-card class="mb-4">
          <template #title>Request Information</template>
          <template #content>
            <div class="grid">
              <div class="col-12 md:col-6">
                <p><strong>Status:</strong> {{ serviceRequest.status }}</p>
                <p><strong>Priority:</strong> {{ serviceRequest.priority }}</p>
                <p><strong>Description:</strong> {{ serviceRequest.description }}</p>
              </div>
              <div class="col-12 md:col-6">
                <p><strong>Site ID:</strong> {{ serviceRequest.siteId }}</p>
                <p><strong>Equipment ID:</strong> {{ serviceRequest.equipmentId }}</p>
                <p><strong>Created At:</strong> {{ new Date(serviceRequest.createdAt).toLocaleString() }}</p>
              </div>
            </div>
            <div class="mt-4">
              <pv-button label="View Equipment Details" icon="pi pi-server" @click="openEquipmentDialog" />
            </div>
          </template>
        </pv-card>

        <!-- Interventions History -->
        <pv-card class="mb-4">
          <template #title>Interventions Log</template>
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
                    {{ slotProps.item.status }} - {{ new Date(slotProps.item.startTime).toLocaleDateString() }}
                  </template>
                  <template #subtitle>
                    Technician ID: {{ slotProps.item.technicianId }}
                  </template>
                  <template #content>
                    <p class="line-clamp-2">{{ slotProps.item.summary }}</p>
                    <pv-button label="View Details" icon="pi pi-arrow-right" text class="p-button-sm mt-2" />
                  </template>
                </pv-card>
              </template>
            </pv-timeline>
          </template>
        </pv-card>

        <!-- Register New Intervention (Provider only) -->
        <pv-card v-if="isProvider">
          <template #title>Register New Intervention</template>
          <template #content>
            <form @submit.prevent="registerIntervention" class="flex flex-column gap-4">
              <div class="p-fluid">
                <label for="technician">Select Technician</label>
                <pv-dropdown id="technician" v-model="newIntervention.technicianId" :options="technicians" optionLabel="name" optionValue="id" placeholder="Select a Technician" />
              </div>
              <div class="p-fluid">
                <label for="summary">Work Summary</label>
                <pv-textarea id="summary" v-model="newIntervention.summary" rows="3" required />
              </div>
              <div class="grid formgrid">
                <div class="col-12 md:col-6">
                  <label for="startTime">Start Time</label>
                  <pv-calendar id="startTime" v-model="newIntervention.startTime" showTime hourFormat="24" />
                </div>
                <div class="col-12 md:col-6">
                  <label for="endTime">End Time (optional)</label>
                  <pv-calendar id="endTime" v-model="newIntervention.endTime" showTime hourFormat="24" />
                </div>
              </div>
              <div class="p-fluid">
                <label for="photoUrl">Add Photo URL</label>
                <div class="p-inputgroup">
                  <pv-input-text id="photoUrl" v-model="newPhotoUrl" placeholder="https://example.com/photo.jpg" />
                  <pv-button icon="pi pi-plus" class="p-button-secondary" @click="addPhotoUrl" type="button" />
                </div>
                <div v-if="newIntervention.photoUrls && newIntervention.photoUrls.length" class="mt-2 flex flex-wrap gap-2">
                  <img v-for="url in newIntervention.photoUrls" :key="url" :src="url" class="w-4rem h-4rem shadow-1 border-round"/>
                </div>
              </div>
              <pv-button type="submit" label="Register Intervention" />
            </form>
          </template>
        </pv-card>

      </div>
      <div v-else>
        <p>Service request not found.</p>
      </div>
    </div>

    <!-- Equipment Details Dialog -->
    <pv-dialog v-model:visible="displayEquipmentDialog" header="Equipment Details" :modal="true" class="p-fluid" style="width: 50vw">
      <div v-if="selectedEquipment">
        <div class="grid">
          <div class="col-6"><strong>Name:</strong> {{ selectedEquipment.name }}</div>
          <div class="col-6"><strong>Model:</strong> {{ selectedEquipment.model }}</div>
          <div class="col-6"><strong>Serial:</strong> {{ selectedEquipment.serial }}</div>
          <div class="col-6"><strong>Type:</strong> {{ selectedEquipment.type }}</div>
          <div class="col-6"><strong>Status:</strong> <pv-tag :value="selectedEquipment.status" /></div>
          <div class="col-6"><strong>Installed:</strong> {{ new Date(selectedEquipment.installedAt).toLocaleDateString() }}</div>
        </div>
      </div>
      <template #footer>
        <pv-button label="Close" icon="pi pi-times" @click="displayEquipmentDialog = false" class="p-button-text"/>
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
