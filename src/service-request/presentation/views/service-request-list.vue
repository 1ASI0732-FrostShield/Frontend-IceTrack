<script setup>

import { useI18n } from '@/i18n.js';
import { useRouter } from "vue-router";
import { computed, ref, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useServiceRequestStore} from "@/service-request/application/service-requests.store.js";
import { useAuthStore } from "@/iam/application/auth.store.js";
import { ReviewsApi } from "@/feedback/infrastructure/reviews.api.js";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';
import { storeToRefs } from "pinia";
import { useReportPdf } from '@/composables/useReportPdf.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const requestsStore = useServiceRequestStore();
const authStore = useAuthStore();
const reviewsApi = new ReviewsApi();
const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
const { generateTechnicalReport } = useReportPdf();
const downloadingPdf = ref(null);

async function downloadRequestPdf(request) {
  downloadingPdf.value = request.id;
  try {
    const [interventionsRes, techsRes] = await Promise.all([
      serviceRequestApi.getInterventionsByRequestQuery(request.id),
      techniciansApi.getTechniciansByProvider(authStore.currentUserId)
    ]);
    await generateTechnicalReport(
      request,
      interventionsRes.data,
      techsRes.data,
      request.siteName,
      request.equipmentName
    );
  } catch (e) {
    console.error('Failed to generate PDF:', e);
  } finally {
    downloadingPdf.value = null;
  }
}

const { requests, requestsLoaded, errors } = storeToRefs(requestsStore);
const { fetchContextAndRequests, cancelRequest } = requestsStore;
const currentOwnerId = computed(() => authStore.currentUserId);

watch(currentOwnerId, (newId) => {
  if (newId) {
    fetchContextAndRequests(newId);
  }
}, { immediate: true });

const filters = ref({
  status: '',
  type: ''
});

const filteredRequests = computed(() => {
  let list = Array.isArray(requests.value) ? [...requests.value] : [];
  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  list = list.map((req, index) => ({ ...req, orderNumber: index + 1 }));
  if (filters.value.status) list = list.filter(req => req.status === filters.value.status);
  if (filters.value.type) list = list.filter(req => req.type === filters.value.type);
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const statusSeverity = (status) => ({
  pending: 'warn',
  accepted: 'warning',
  inProgress: 'info',
  completed: 'success',
  canceled: 'danger',
  rejected: 'secondary'
}[status] || 'secondary');

const statusTranslation = (status) => t(status ? `services.status.${status}` : 'common.all');
const typeTranslation = (type) => t(type ? `service-requests.types.${type}` : 'common.all');
const navigateToNew = () => router.push({ name: 'service-requests-new' });
const navigateToDetail = (request) => router.push({ name: 'service-request-detail', params: { requestId: request.id } });

const confirmCancel = (request) => {
  confirm.require({
    message: t('services.requests.confirm-cancel', { id: request.id }),
    header: t('services.requests.cancel-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => cancelRequest(request.id),
  });
};

// Review Logic
const displayReviewDialog = ref(false);
const currentServiceRequest = ref(null);
const reviewForm = ref({ comunicacion: 0, eficiencia: 0, profesionalidad: 0, comment: '' });
const existingReview = ref(null);
const reviewAverage = computed(() => {
  const f = reviewForm.value;
  return (f.comunicacion + f.eficiencia + f.profesionalidad) / 3;
});

const ratingFields = [
  { key: 'comunicacion', question: '¿Qué tan clara y efectiva fue la comunicación del técnico?' },
  { key: 'eficiencia', question: '¿Qué tan eficiente fue el técnico al resolver el trabajo?' },
  { key: 'profesionalidad', question: '¿Qué tan profesional fue el trato del técnico?' }
];

const openReviewDialog = async (request) => {
  currentServiceRequest.value = request;
  reviewForm.value = { comunicacion: 0, eficiencia: 0, profesionalidad: 0, comment: '' };
  existingReview.value = null;

  if (request.hasReview) {
    try {
      const response = await reviewsApi.getReviewById(request.reviewId);
      existingReview.value = response.data;
      reviewForm.value.comunicacion = existingReview.value.comunicacion;
      reviewForm.value.eficiencia = existingReview.value.eficiencia;
      reviewForm.value.profesionalidad = existingReview.value.profesionalidad;
      reviewForm.value.comment = existingReview.value.comment;
    } catch (e) { console.error("Failed to load existing review:", e); }
  }
  displayReviewDialog.value = true;
};

const submitReview = async () => {
  if (!currentServiceRequest.value || reviewForm.value.comunicacion === 0 || reviewForm.value.eficiencia === 0 || reviewForm.value.profesionalidad === 0) return;
  try {
    const reviewData = {
      serviceRequestId: currentServiceRequest.value.id,
      ownerId: currentOwnerId.value,
      technicianId: currentServiceRequest.value.technicianId,
      comunicacion: reviewForm.value.comunicacion,
      eficiencia: reviewForm.value.eficiencia,
      profesionalidad: reviewForm.value.profesionalidad,
      comment: reviewForm.value.comment,
      createdAt: new Date().toISOString()
    };
    await reviewsApi.createReview(reviewData);
    displayReviewDialog.value = false;
    await fetchContextAndRequests(currentOwnerId.value);
  } catch (e) { console.error("Error submitting review:", e); }
};

</script>

<template>

  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('services.requests.my-requests') }}</h1>
      <pv-button :label="t('services.requests.new')" icon="pi pi-plus" @click="navigateToNew" />
    </div>

    <div class="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-3 items-center">
      <span class="text-sm font-semibold">{{ t('common.filter-by') }}:</span>

      <pv-select-button v-model="filters.status" :options="['', 'pending', 'accepted', 'inProgress', 'completed', 'canceled', 'rejected']" :allowEmpty="true">
        <template #option="slotProps">{{ statusTranslation(slotProps.option) }}</template>
      </pv-select-button>

      <pv-select-button v-model="filters.type" :options="['', 'corrective', 'preventive']" :allowEmpty="true" class="ml-3">
        <template #option="slotProps">{{ typeTranslation(slotProps.option) }}</template>
      </pv-select-button>
    </div>

    <pv-data-table :value="filteredRequests" :loading="!requestsLoaded" striped-rows :rows="10" paginator table-style="min-width: 50rem">
      <!-- Order -->
      <pv-column field="orderNumber" :header="t('services.requests.order-number')" sortable style="width: 100px;"/>

      <!-- Equipment -->
      <pv-column field="equipmentName" :header="t('services.requests.equipment')" sortable />

      <!-- Site -->
      <pv-column field="siteName" :header="t('services.requests.site')" sortable />

      <!-- Provider -->
      <pv-column field="assignedToName" :header="t('services.requests.provider')" sortable />

      <!-- Type -->
      <pv-column field="type" :header="t('services.requests.type')">
        <template #body="{ data }">
          <pv-tag
              :value="typeTranslation(data.type)"
              :severity="data.type === 'corrective' ? 'danger' : 'warn'"
          />
        </template>
      </pv-column>

      <!-- Status -->
      <pv-column field="status" :header="t('services.requests.status')">
        <template #body="{ data }">
          <pv-tag :value="statusTranslation(data.status)" :severity="statusSeverity(data.status)" />
        </template>
      </pv-column>

      <!-- Actions -->
      <pv-column :header="t('services.requests.actions')" style="width: 280px;">
        <template #body="{ data }">
          <!-- PDF Download -->
          <pv-button
              v-if="data.status === 'completed'"
              icon="pi pi-file-pdf"
              text rounded severity="danger"
              :loading="downloadingPdf === data.id"
              v-tooltip.top="t('reports.actions.downloadPdf')"
              @click="downloadRequestPdf(data)"
          />

          <!-- Details -->
          <pv-button
              icon="pi pi-eye"
              text rounded severity="info"
              v-tooltip.top="t('services.requests.detail')"
              @click="navigateToDetail(data)"
          />

          <!-- Danger -->
          <pv-button
              v-if="['pending', 'accepted'].includes(data.status)"
              icon="pi pi-times"
              text rounded severity="danger"
              v-tooltip.top="t('common.cancel-tooltip')"
              @click="confirmCancel(data)" />

          <!-- Review -->
          <pv-button
              v-if="data.status === 'completed' || data.status === 'canceled' || data.status === 'rejected' || data.status === 'inProgress'"
              icon="pi pi-star"
              text rounded
              :severity="data.hasReview ? 'info' : 'warning'"
              :disabled="data.status === 'canceled' || data.status === 'rejected' || data.status === 'inProgress'"
              v-tooltip.top="t('services.requests.view-review')"
              @click="openReviewDialog(data)"
          />
        </template>
      </pv-column>

    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">{{ t('common.error-occurred') }}: {{ errors.map(e => e.message).join(', ') }}</div>

    <pv-confirm-dialog/>

    <!-- technician Rating -->
    <pv-dialog v-model:visible="displayReviewDialog" :header="currentServiceRequest && currentServiceRequest.hasReview ? t('services.requests.view-review-header') : t('services.requests.submit-review-header')" :modal="true" class="p-fluid">
      <div v-for="field in ratingFields" :key="field.key" class="field mt-3">
        <label>{{ field.question }}</label>
        <div class="rating-slider-container mt-2">
          <div class="rating-slider">
            <div
              v-for="n in 5"
              :key="n"
              class="slider-segment"
              :class="{
                active: n <= reviewForm[field.key],
                readonly: currentServiceRequest?.hasReview
              }"
              @click="!currentServiceRequest?.hasReview && (reviewForm[field.key] = n)"
            >
              <span class="segment-number">{{ n }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentServiceRequest && currentServiceRequest.hasReview" class="field mt-3">
        <label>{{ t('services.requests.review-average') }}</label>
        <div class="mt-2 font-bold text-xl">
          {{ reviewAverage.toFixed(1) }}
        </div>
      </div>

      <div class="field mt-3">
        <label for="comment">{{ t('services.requests.comment') }}</label>
        <pv-textarea id="comment" v-model="reviewForm.comment" rows="5" class="w-full mt-2" :readonly="currentServiceRequest && currentServiceRequest.hasReview" />
      </div>

      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="displayReviewDialog = false" />
        <pv-button v-if="currentServiceRequest && !currentServiceRequest.hasReview" :label="t('common.submit')" icon="pi pi-check" autofocus @click="submitReview" />
      </template>
    </pv-dialog>
  </div>

</template>

<style scoped>
.rating-slider-container {
  display: flex;
  align-items: center;
}
.rating-slider {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  flex: 1;
  max-width: 300px;
}
.slider-segment {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  background: var(--app-surface-muted);
  border-right: 1px solid var(--app-border);
  transition: background-color 0.15s;
  user-select: none;
}
.slider-segment:last-child {
  border-right: none;
}
.slider-segment:hover:not(.readonly) {
  background: var(--app-primary-soft);
}
.slider-segment.active {
  background: var(--app-primary);
  color: var(--app-primary-contrast);
}
.slider-segment.readonly {
  cursor: default;
}
.segment-number {
  font-weight: 600;
  font-size: 0.9rem;
  pointer-events: none;
}
</style>