<script setup>

import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const navigateToDetail = (request) => {
  router.push({ name: 'service-request-detail', params: { requestId: request.id } });
};

const { t } = useI18n();
const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
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
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'accepted'),
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value, 'inProgress'),
      techniciansApi.getTechniciansByProvider(currentProviderId.value)
    ]);

    const context = { technicians: techsRes.data };
    const accepted = ServiceRequestAssembler.toEntitiesFromResponse(acceptedRes.data, context);
    const inProgress = ServiceRequestAssembler.toEntitiesFromResponse(inProgressRes.data, context);

    const combined = [...accepted, ...inProgress];

    const interventionChecks = await Promise.all(
        combined.map(r =>
            r.status === 'inProgress'
                ? serviceRequestApi.getInterventionsByRequestQuery(r.id)
                : Promise.resolve({ data: [] })
        )
    );

    activeRequests.value = combined.map((r, i) => ({
      ...r,
      hasInterventions: interventionChecks[i].data.length > 0
    }));

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
  await serviceRequestApi.sendAssignTechnicianCommand(requestId, technicianId);
  await fetchData();
};

const completeService = async (requestId) => {
  await serviceRequestApi.sendCompleteRequestCommand(requestId);
  await fetchData();
};

const reassigning = ref({});

const reassignTechnician = async (requestId) => {
  const technicianId = selectedTechnicians.value[requestId];
  if (!technicianId) return;
  await serviceRequestApi.sendAssignTechnicianCommand(requestId, technicianId);
  reassigning.value[requestId] = false;
  await fetchData();
};

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
          <!-- Id -->
          <pv-column field="id" :header="t('services.in-progress.id')" sortable style="width: 10%"></pv-column>

          <!-- Description -->
          <pv-column field="description" :header="t('services.in-progress.description')" style="width: 30%"></pv-column>

          <!-- Status -->
          <pv-column field="status" :header="t('services.in-progress.status')" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.status === 'accepted' ? 'warning' : 'info'" :value="getStatusTranslation(data.status)"></pv-tag>
            </template>
          </pv-column>

          <!-- Technician Name -->
          <pv-column field="technicianName" :header="t('services.in-progress.assigned-technician')" sortable style="width: 20%">
            <template #body="{ data }">
              {{ data.technicianName || t('services.in-progress.not-assigned') }}
            </template>
          </pv-column>

          <!-- Actions -->
          <pv-column :header="t('services.in-progress.actions')" style="width: 25%">
            <template #body="{ data }">
              <div v-if="data.status === 'accepted'" class="flex align-items-center">
                <pv-select v-model="selectedTechnicians[data.id]" :options="technicians" optionLabel="name" optionValue="id" :placeholder="t('services.in-progress.assign-technician')" class="mr-2" style="min-width: 150px;"/>
                <pv-button icon="pi pi-user-plus" @click="assignTechnician(data.id)" :disabled="!selectedTechnicians[data.id]"/>
              </div>

              <div v-if="data.status === 'inProgress'" class="flex align-items-center gap-2">
                <template v-if="reassigning[data.id]">
                  <!-- Add Technician -->
                  <pv-select
                      v-model="selectedTechnicians[data.id]"
                      :options="technicians"
                      optionLabel="name"
                      optionValue="id"
                      :placeholder="t('services.in-progress.assign-technician')"
                      style="min-width: 150px;"
                  />

                  <!-- Accept -->
                  <pv-button
                      icon="pi pi-check"
                      severity="success"
                      text
                      rounded
                      @click="reassignTechnician(data.id)"
                      :disabled="!selectedTechnicians[data.id]"
                  />

                  <!-- Cancel -->
                  <pv-button
                      icon="pi pi-times"
                      severity="secondary" text
                      rounded
                      @click="reassigning[data.id] = false"
                  />
                </template>

                <template v-else>
                  <!-- Accept -->
                  <pv-button
                      :label="t('services.in-progress.complete')"
                      icon="pi pi-check-circle"
                      class="p-button-success"
                      :disabled="!data.hasInterventions"
                      @click="completeService(data.id)"
                  />

                  <!-- Reject -->
                  <pv-button icon="pi pi-user-edit"
                             text rounded severity="warning"
                             @click="reassigning[data.id] = true"
                  />
                  </template>
              </div>
            </template>
          </pv-column>

          <!-- Create Report -->
          <pv-column :header="t('provider.services.list.details')">
            <template #body="{ data }">
              <pv-button
                  icon="pi pi-file"
                  text rounded severity="info"
                  @click="navigateToDetail(data)"
                  v-tooltip.top="t('provider.services.list.create-details')"
              />
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
