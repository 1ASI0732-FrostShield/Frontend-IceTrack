<script setup>
import { ref, onMounted, computed } from 'vue';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
const iamApi = new IamApi();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const completedRequests = ref([]);

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [requestsRes, usersRes, techsRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'completed'),
      iamApi.http.get('/users'),
      techniciansApi.getTechniciansByProvider(currentProviderId.value)
    ]);

    const context = { users: usersRes.data, technicians: techsRes.data };
    completedRequests.value = ServiceRequestAssembler.toEntitiesFromResponse(requestsRes.data, context);

  } catch (e) {
    error.value = 'Failed to load completed infrastructure.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Completed Services</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="completedRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
          <pv-column field="description" header="Description" style="width: 40%"></pv-column>
          <pv-column field="siteName" header="Site" sortable style="width: 20%"></pv-column>
          <pv-column field="technicianName" header="Technician" sortable style="width: 20%"></pv-column>
          <pv-column field="completedAt" header="Completed At" sortable style="width: 10%">
            <template #body="{ data }">
              {{ new Date(data.completedAt).toLocaleDateString() }}
            </template>
          </pv-column>
          <template #empty>
            No completed services found.
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
