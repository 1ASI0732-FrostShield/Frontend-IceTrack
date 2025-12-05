<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const { t } = useI18n();
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
    <h1 class="text-3xl font-bold mb-4">{{ t('services.completed.title') }}</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="completedRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" :header="t('services.completed.id')" sortable style="width: 10%"></pv-column>
          <pv-column field="description" :header="t('services.completed.description')" style="width: 40%"></pv-column>
          <pv-column field="siteName" :header="t('services.completed.site')" sortable style="width: 20%"></pv-column>
          <pv-column field="technicianName" :header="t('services.completed.technician')" sortable style="width: 20%"></pv-column>
          <pv-column field="completedAt" :header="t('services.completed.completed-at')" sortable style="width: 10%">
            <template #body="{ data }">
              {{ new Date(data.completedAt).toLocaleDateString() }}
            </template>
          </pv-column>
          <template #empty>
            {{ t('services.completed.no-completed-services') }}
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
