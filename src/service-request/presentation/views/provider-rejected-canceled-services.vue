<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";

const { t } = useI18n();
const serviceRequestApi = new ServiceRequestsApi();
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
    const [rejectedRes, canceledRes, usersRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'rejected'),
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'canceled'),
      iamApi.http.get('/users')
    ]);

    const context = { users: usersRes.data };
    const rejected = ServiceRequestAssembler.toEntitiesFromResponse(rejectedRes.data, context);
    const canceled = ServiceRequestAssembler.toEntitiesFromResponse(canceledRes.data, context);

    rejectedCanceledRequests.value = [...rejected, ...canceled];

  } catch (e) {
    error.value = 'Failed to load rejected/canceled infrastructure.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const getStatusTranslation = (status) => {
  return t(`services.status.${status}`);
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">{{ t('services.rejected-canceled.title') }}</h1>
    <pv-card>
      <template #content>
        <pv-data-table :value="rejectedCanceledRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" :header="t('services.rejected-canceled.id')" sortable style="width: 10%"></pv-column>
          <pv-column field="description" :header="t('services.rejected-canceled.description')" style="width: 40%"></pv-column>
          <pv-column field="siteName" :header="t('services.rejected-canceled.site')" sortable style="width: 20%"></pv-column>
          <pv-column field="status" :header="t('services.rejected-canceled.status')" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.status === 'rejected' ? 'danger' : 'secondary'" :value="getStatusTranslation(data.status)"></pv-tag>
            </template>
          </pv-column>
          <pv-column field="canceledAt" :header="t('services.rejected-canceled.date')" sortable style="width: 15%">
            <template #body="{ data }">
              {{ new Date(data.canceledAt || data.createdAt).toLocaleDateString() }}
            </template>
          </pv-column>
          <template #empty>
            {{ t('services.rejected-canceled.no-rejected-canceled-services') }}
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
