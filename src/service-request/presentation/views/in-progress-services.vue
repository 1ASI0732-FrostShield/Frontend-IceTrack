<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">In-Progress Services</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="activeRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
          <pv-column field="description" header="Description" style="width: 30%"></pv-column>
          <pv-column field="status" header="Status" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.status === 'accepted' ? 'warning' : 'info'" :value="data.status"></pv-tag>
            </template>
          </pv-column>
          <pv-column field="technicianName" header="Assigned Technician" sortable style="width: 20%">
            <template #body="{ data }">
              {{ data.technicianName || 'Not Assigned' }}
            </template>
          </pv-column>
          <pv-column header="Actions" style="width: 25%">
            <template #body="{ data }">
              <div v-if="data.status === 'accepted'" class="flex align-items-center">
                <pv-select v-model="selectedTechnicians[data.id]" :options="technicians" optionLabel="name" optionValue="id" placeholder="Assign Technician" class="mr-2" style="min-width: 150px;"/>
                <pv-button icon="pi pi-user-plus" @click="assignTechnician(data.id)" :disabled="!selectedTechnicians[data.id]"/>
              </div>
              <pv-button v-if="data.status === 'inProgress'" label="Complete" icon="pi pi-check-circle" class="p-button-success" @click="completeService(data.id)"/>
            </template>
          </pv-column>
          <template #empty>
            No active services found.
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ServiceRequestsApi } from '@/service-request/infrastructure/service-requests-api.js';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";

const serviceApi = new ServiceRequestsApi();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const activeRequests = ref([]);
const technicians = ref([]);
const selectedTechnicians = ref({});

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [acceptedRes, inProgressRes, techsRes] = await Promise.all([
      serviceApi.getRequestsForProvider(currentProviderId.value, 'accepted'),
      serviceApi.getRequestsForProvider(currentProviderId.value, 'inProgress'),
      serviceApi.getTechniciansByProvider(currentProviderId.value)
    ]);

    const context = { technicians: techsRes.data };
    const accepted = acceptedRes.data.map(r => ServiceRequestAssembler.toEntityFromResource(r, context));
    const inProgress = inProgressRes.data.map(r => ServiceRequestAssembler.toEntityFromResource(r, context));

    activeRequests.value = [...accepted, ...inProgress];
    technicians.value = techsRes.data;
  } catch (e) {
    error.value = 'Failed to load data.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const assignTechnician = async (requestId) => {
  const technicianId = selectedTechnicians.value[requestId];
  if (!technicianId) return;
  await serviceApi.assignTechnician(requestId, technicianId);
  await fetchData();
};

const completeService = async (requestId) => {
  await serviceApi.completeRequest(requestId);
  await fetchData();
};

onMounted(fetchData);
</script>
