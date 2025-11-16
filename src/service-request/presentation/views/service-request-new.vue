<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import useServiceRequestsStore from "../../application/service-requests.store.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { useAuthStore } from "@/iam/application/auth.store.js";

const { t } = useI18n();
const router = useRouter();
const store = useServiceRequestsStore();
const authStore = useAuthStore();
const { errors, createRequest } = store;
const iamApi = new IamApi();

const currentRequesterId = computed(() => authStore.currentUserId);

const form = ref({
  siteId: null,
  equipmentId: null,
  assignedTo: null,
  type: 'corrective',
  priority: 'medium',
  description: '',
});

const sites = ref([]);
const equipments = ref([]);
const providers = ref([]);

const filteredEquipments = computed(() => {
  if (!form.value.siteId) return [];
  return equipments.value.filter(eq => eq.siteId === form.value.siteId);
});

onMounted(async () => {
  try {
    const [sitesRes, equipRes, providersRes] = await Promise.all([
      iamApi.http.get(`/sites`),
      iamApi.http.get(`/equipments`),
      iamApi.getUsersByRole('provider')
    ]);
    sites.value = sitesRes.data;
    equipments.value = equipRes.data;
    providers.value = providersRes.data;
  } catch (error) {
    errors.value.push(error);
  }
});

const handleSiteChange = () => {
  form.value.equipmentId = null;
};

const saveRequest = async () => {
  if (!form.value.siteId || !form.value.equipmentId || !form.value.description || !form.value.assignedTo) {
    alert("Por favor complete todos los campos requeridos.");
    return;
  }

  const newRequestData = {
    requesterId: currentRequesterId.value,
    siteId: form.value.siteId,
    equipmentId: form.value.equipmentId,
    assignedTo: form.value.assignedTo,
    origin: 'manual',
    type: form.value.type,
    priority: form.value.priority,
    description: form.value.description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const success = await createRequest(newRequestData);

  if (success) {
    alert('Request created successfully!');
    navigateBack();
  } else {
    alert('Error creating request.');
  }
};

const navigateBack = () => {
  router.push({ name: 'service-requests-list' });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('service-requests.new-request-title') }}</h1>
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
                    optionLabel="name"
                    optionValue="id"
                    required
                    class="w-full"
                />
                <label for="provider">Service Provider *</label>
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
                    @change="handleSiteChange"
                    required
                    class="w-full"
                />
                <label for="site">{{ t('service-requests.site') }} *</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="equipment"
                    v-model="form.equipmentId"
                    :options="filteredEquipments"
                    optionLabel="name"
                    optionValue="id"
                    :disabled="!form.siteId"
                    required
                    class="w-full"
                />
                <label for="equipment">{{ t('service-requests.equipment') }} *</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="type"
                    v-model="form.type"
                    :options="[{label: 'Reparación (Correctivo)', value: 'corrective'}, {label: 'Mantenimiento (Preventivo)', value: 'preventive'}]"
                    optionLabel="label"
                    optionValue="value"
                    required
                    class="w-full"
                />
                <label for="type">{{ t('service-requests.request-type') }} *</label>
              </pv-float-label>
            </div>

            <div class="field col-12 md:col-6">
              <pv-float-label>
                <pv-select
                    id="priority"
                    v-model="form.priority"
                    :options="[{label: 'Alta', value: 'high'}, {label: 'Media', value: 'medium'}, {label: 'Baja', value: 'low'}]"
                    optionLabel="label"
                    optionValue="value"
                    required
                    class="w-full"
                />
                <label for="priority">{{ t('service-requests.priority') }}</label>
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
                <label for="description">{{ t('service-requests.problem-description') }} *</label>
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