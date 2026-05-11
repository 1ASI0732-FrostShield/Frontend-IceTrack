<script setup>

import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useServiceRequestStore} from "@/service-request/application/service-requests.store.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { useAuthStore } from "@/iam/application/auth.store.js";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
import { EquipmentAssembler } from "@/monitoring/infrastructure/equipments.assembler.js";
import {storeToRefs} from "pinia";

const { t } = useI18n();
const router = useRouter();
const store = useServiceRequestStore();
const authStore = useAuthStore();
const { errors, requests } = storeToRefs(store);
const iamApi = new IamApi();
const serviceRequestApi = new ServiceRequestsApi();
const assetsManagementApi = new AssetsManagementApi();
const monitoringApi = new MonitoringApi();
const currentRequesterId = computed(() => authStore.currentUserId);

const form = ref({
  siteId: null,
  equipmentId: null,
  assignedTo: null,
  type: 'Corrective',
  priority: null,
  description: '',
});

const sites = ref([]);
const equipments = ref([]);
const providers = ref([]);

onMounted(async () => {
  try {
    const [providersRes, sitesRes, equipmentsRes] = await Promise.all([
      iamApi.getUsersByRole('Provider'),
      assetsManagementApi.getSites(),
      monitoringApi.getEquipment()
    ]);
    providers.value = providersRes.data;
    sites.value = sitesRes.data;
    equipments.value = EquipmentAssembler.toEntitiesFromResponse(equipmentsRes);
    console.log('equipments:', equipments.value);
  } catch (error) {
    errors.value.push(error);
  }
});

const handleSiteChange = () => {
  form.value.equipmentId = null;
};

const saveRequest = async () => {
  if (!form.value.description || !form.value.assignedTo || !form.value.siteId || !form.value.equipmentId) {
    alert(t('services.new.alert-required-fields'));
    return;
  }

  const newRequestData = {
    requesterId: currentRequesterId.value,
    siteId: form.value.siteId,
    equipmentId: form.value.equipmentId,
    assignedTo: form.value.assignedTo,
    origin: 'Manual',
    type: selectedEquipmentStatus.value === 'MAINTENANCE' ? 'preventive' : 'corrective',
    priority: form.value.priority,
    description: form.value.description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await serviceRequestApi.sendNewRequestCommand(newRequestData);
    await store.fetchContextAndRequests(currentRequesterId.value);
    alert(t('services.new.alert-request-created'));
    navigateBack();
  } catch (error) {
    errors.value.push(error);
    alert(t('services.new.alert-create-error'));
  }
};

const navigateBack = () => {
  router.push({ name: 'service-requests-list' });
};

const filteredEquipments = computed(() => {
  if (!form.value.siteId) return [];
  return equipments.value.filter(e => e.siteId === form.value.siteId);
});

const selectedEquipmentStatus = computed(() => {
  const equipment = equipments.value.find(e => e.id === form.value.equipmentId);
  return equipment ? equipment.status.toUpperCase() : '';
});

const isFormValid = computed(() => {
  return (
      form.value.siteId !== null &&
      form.value.equipmentId !== null &&
      form.value.assignedTo !== null &&
      form.value.priority !== null &&
      form.value.description !== null &&
      selectedEquipmentStatus.value !== 'ACTIVE' &&
      !equipmentAlreadyInUse.value
  );
});

const equipmentAlreadyInUse = computed(() => {
  if (!form.value.equipmentId) return false;
  const activeStatuses = ['pending', 'accepted', 'inProgress'];
  return requests.value?.some(
      r => r.equipmentId === form.value.equipmentId && activeStatuses.includes(r.status)
  );
});

</script>

<template>

  <div class="p-4">
    <h1>{{ t('services.new.title') }}</h1>
    <pv-card class="mt-4">
      <template #content>
        <form @submit.prevent="saveRequest">

          <div class="p-fluid grid">
            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="provider"
                    v-model="form.assignedTo"
                    :options="providers"
                    optionLabel="username"
                    optionValue="id"
                    required
                    class="w-full"
                />
                <label for="provider">{{ t('services.new.provider') }}</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="site"
                    v-model="form.siteId"
                    :options="sites"
                    optionLabel="name"
                    optionValue="id"
                    required
                    class="w-full"
                    @change="handleSiteChange"
                />
                <label for="site">{{ t('services.new.site') }}</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="equipment"
                    v-model="form.equipmentId"
                    :options="filteredEquipments"
                    optionLabel="model"
                    optionValue="id"
                    required
                    class="w-full"
                    :disabled="!form.siteId"
                />
                <label for="equipment">{{ t('services.new.equipment') }}</label>
              </pv-float-label>
              <small v-if="equipmentAlreadyInUse" class="text-red-500 mt-1">
                {{ t('services.new.equipment-already-in-use') }}
              </small>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-input-text
                    id="type"
                    :value="selectedEquipmentStatus"
                    class="w-full font-bold"
                    readonly
                    placeholder=" "
                />
                <label for="type">{{ t('services.new.request-type') }}</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="priority"
                    v-model="form.priority"
                    :options="[{label: t('service-requests.priorities.high'), value: 'high'}, {label: t('service-requests.priorities.medium'), value: 'medium'}, {label: t('service-requests.priorities.low'), value: 'low'}]"
                    optionLabel="label"
                    optionValue="value"
                    required
                    class="w-full"
                />
                <label for="priority">{{ t('services.new.priority') }}</label>
              </pv-float-label>
            </div>

            <div class="field col-12">
              <pv-float-label>
                <pv-textarea
                    id="description"
                    v-model="form.description"
                    rows="5"
                    required
                    class="w-full"
                />
                <label for="description">{{ t('services.new.description') }}</label>
              </pv-float-label>
            </div>

          </div>

          <div class="flex justify-content-end mt-4">
            <pv-button
                :label="t('common.cancel')"
                severity="secondary"
                @click="navigateBack"
                class="mr-2"
            />

            <pv-button
                :label="t('common.submit-request')"
                icon="pi pi-check"
                type="submit"
                :disabled="!isFormValid"
            />
          </div>
        </form>

        <div v-if="errors.length" class="text-red-500 mt-3">
          {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
      </template>
    </pv-card>
  </div>

</template>

<style scoped>
</style>