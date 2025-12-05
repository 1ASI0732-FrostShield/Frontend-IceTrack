<script setup>
/**
 * @file intervention-detail.vue
 * @description This component displays the details of a specific intervention.
 * @author Kenyi Ramirez
 */
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { IamApi } from '@/iam/infrastructure/iam.api.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const api = new ServiceRequestsApi();
const iamApi = new IamApi();

/** @type {import('vue').Ref<object|null>} */
const intervention = ref(null);
/** @type {import('vue').Ref<object|null>} */
const technician = ref(null);
/** @type {import('vue').Ref<boolean>} */
const isLoading = ref(false);

/**
 * Computed property for the intervention ID from the route parameters.
 * @type {import('vue').ComputedRef<number>}
 */
const interventionId = computed(() => route.params.interventionId);

/**
 * Fetches the details of the intervention and the assigned technician.
 * @async
 * @function fetchData
 */
async function fetchData() {
  isLoading.value = true;
  try {
    const interventionRes = await api.getInterventionDetailsQuery(interventionId.value);
    intervention.value = interventionRes.data;

    if (intervention.value.technicianId) {
      const techRes = await iamApi.http.get(`/technicians/${intervention.value.technicianId}`);
      technician.value = techRes.data;
    }
  } catch (error) {
    console.error("Failed to fetch intervention details:", error);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navigates back to the previous page.
 * @function goBack
 */
function goBack() {
  router.back();
}

/**
 * Returns the translated status string.
 * @param {string} status - The status to translate.
 * @returns {string} The translated status.
 * @function getStatusTranslation
 */
const getStatusTranslation = (status) => {
  if (!status) return '';
  const key = Object.keys(t('services.status')).find(k => k.toLowerCase() === status.toLowerCase());
  return key ? t(`services.status.${key}`) : status;
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <pv-card v-if="isLoading">
      <template #content><p>{{ t('common.loading') }}</p></template>
    </pv-card>

    <div v-else-if="intervention">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold m-0">{{ t('services.intervention.title') }} #{{ intervention.id }}</h1>
        <pv-button icon="pi pi-arrow-left" :label="t('services.intervention.back-to-request')" @click="goBack" />
      </div>

      <div class="grid">
        <!-- Details Card -->
        <div class="col-12 md:col-6">
          <pv-card>
            <template #title>{{ t('services.intervention.details') }}</template>
            <template #content>
              <p><strong>{{ t('common.status.title') }}:</strong> <pv-tag :severity="intervention.status === 'Completed' ? 'success' : 'info'" :value="getStatusTranslation(intervention.status)" /></p>
              <p><strong>{{ t('services.intervention.technician') }}</strong> {{ technician ? technician.name : t('services.in-progress.not-assigned') }}</p>
              <p><strong>{{ t('services.intervention.start-time') }}</strong> {{ new Date(intervention.startTime).toLocaleString() }}</p>
              <p v-if="intervention.endTime"><strong>{{ t('services.intervention.end-time') }}</strong> {{ new Date(intervention.endTime).toLocaleString() }}</p>
            </template>
          </pv-card>
        </div>

        <!-- Summary Card -->
        <div class="col-12 md:col-6">
          <pv-card>
            <template #title>{{ t('services.intervention.work-summary') }}</template>
            <template #content>
              <p>{{ intervention.summary }}</p>
            </template>
          </pv-card>
        </div>

        <!-- Evidence Card -->
        <div class="col-12">
          <pv-card>
            <template #title>{{ t('services.intervention.evidence-photos') }}</template>
            <template #content>
              <div v-if="intervention.photoUrls && intervention.photoUrls.length" class="flex flex-wrap gap-4">
                <div v-for="url in intervention.photoUrls" :key="url">
                  <img :src="url" alt="Evidence Photo" class="w-full h-auto border-round shadow-2" style="max-width: 400px;" />
                </div>
              </div>
              <p v-else>{{ t('services.intervention.no-photos') }}</p>
            </template>
          </pv-card>
        </div>
      </div>
    </div>

    <div v-else>
      <p>{{ t('services.intervention.not-found') }}</p>
    </div>
  </div>
</template>
