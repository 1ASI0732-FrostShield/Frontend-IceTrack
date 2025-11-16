<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Rejected / Canceled Services</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="rejectedCanceledRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
          <pv-column field="description" header="Description" style="width: 40%"></pv-column>
          <pv-column field="siteName" header="Site" sortable style="width: 20%"></pv-column>
          <pv-column field="status" header="Status" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.status === 'rejected' ? 'danger' : 'secondary'" :value="data.status"></pv-tag>
            </template>
          </pv-column>
          <pv-column field="canceledAt" header="Date" sortable style="width: 15%">
            <template #body="{ data }">
              {{ new Date(data.canceledAt || data.createdAt).toLocaleDateString() }}
            </template>
          </pv-column>
          <template #empty>
            No rejected or canceled services found.
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
import { IamApi } from "@/iam/infrastructure/iam.api.js";

const serviceApi = new ServiceRequestsApi();
const iamApi = new IamApi();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const rejectedCanceledRequests = ref([]);

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [rejectedRes, canceledRes, sitesRes] = await Promise.all([
      serviceApi.getRequestsForProvider(currentProviderId.value, 'rejected'),
      serviceApi.getRequestsForProvider(currentProviderId.value, 'canceled'),
      iamApi.http.get('/sites')
    ]);

    const context = { sites: sitesRes.data };
    const rejected = rejectedRes.data.map(r => ServiceRequestAssembler.toEntityFromResource(r, context));
    const canceled = canceledRes.data.map(r => ServiceRequestAssembler.toEntityFromResource(r, context));

    rejectedCanceledRequests.value = [...rejected, ...canceled];

  } catch (e) {
    error.value = 'Failed to load rejected/canceled services.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>
