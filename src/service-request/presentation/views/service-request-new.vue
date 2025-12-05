<script setup>
/**
 * @file service-request-new.vue
 * @description This component allows users to create a new service request.
 * @author Kenyi Ramirez
 */
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useServiceRequestStore} from "@/service-request/application/service-requests.store.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { useAuthStore } from "@/iam/application/auth.store.js";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";

const { t } = useI18n();
const router = useRouter();
const store = useServiceRequestStore();
const authStore = useAuthStore();
const { errors } = store;
const iamApi = new IamApi();
const serviceRequestApi = new ServiceRequestsApi();
const assetsManagementApi = new AssetsManagementApi();
const monitoringApi = new MonitoringApi();

/**
 * Computed property for the current requester's ID.
 * @type {import('vue').ComputedRef<number>}
 */
const currentRequesterId = computed(() => authStore.currentUserId);

/**
 * Reactive form data for the new service request.
 * @type {import('vue').Ref<object>}
 */
const form = ref({
  siteId: null,
  equipmentId: null,
  assignedTo: null,
  type: 'Corrective',
  priority: 'Medium',
  description: '',
});

/** @type {import('vue').Ref<Array<object>>} */
const sites = ref([]);
/** @type {import('vue').Ref<Array<object>>} */
const equipments = ref([]);
/** @type {import('vue').Ref<Array<object>>} */
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
    equipments.value = equipmentsRes.data;
  } catch (error) {
    errors.value.push(error);
  }
});

/**
 * Handles the change event for site selection.
 * @function handleSiteChange
 */
const handleSiteChange = () => {
  // form.value.equipmentId = null;
};

/**
 * Saves the new service request.
 * @async
 * @function saveRequest
 */
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
    type: form.value.type,
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

/**
 * Navigates back to the service requests list.
 * @function navigateBack
 */
const navigateBack = () => {
  router.push({ name: 'service-requests-list' });
};
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
                    :options="equipments"
                    optionLabel="name"
                    optionValue="id"
                    required
                    class="w-full"
                />
                <label for="equipment">{{ t('services.new.equipment') }}</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="type"
                    v-model="form.type"
                    :options="[{label: t('service-requests.types.corrective'), value: 'corrective'}, {label: t('service-requests.types.preventive'), value: 'preventive'}]"
                    optionLabel="label"
                    optionValue="value"
                    required
                    class="w-full"
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
            <pv-button :label="t('common.cancel')" severity="secondary" @click="navigateBack" class="mr-2"/>
            <pv-button :label="t('common.submit-request')" icon="pi pi-check" type="submit"/>
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
