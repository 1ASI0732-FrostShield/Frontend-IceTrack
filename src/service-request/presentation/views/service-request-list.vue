<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { computed, ref, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import useServiceRequestsStore from "../../application/service-requests.store.js";
import { useAuthStore } from "@/iam/application/auth.store.js";
import { ServiceRequestsApi } from "@/service-request/infrastructure/service-requests-api.js";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const requestsStore = useServiceRequestsStore();
const authStore = useAuthStore();
const serviceApi = new ServiceRequestsApi();

const { requests, requestsLoaded, errors } = storeToRefs(requestsStore);
const { fetchServiceRequests, cancelRequest } = requestsStore;

const currentOwnerId = computed(() => authStore.currentUserId);

watch(currentOwnerId, (newId) => {
  if (newId) {
    fetchServiceRequests(newId);
  }
}, { immediate: true });

const filters = ref({
  status: '',
  type: ''
});

const filteredRequests = computed(() => {
  let list = Array.isArray(requests.value) ? requests.value : [];
  if (filters.value.status) list = list.filter(req => req.status === filters.value.status);
  if (filters.value.type) list = list.filter(req => req.type === filters.value.type);
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const statusSeverity = (status) => {
  const severities = {
    pending: 'danger',
    accepted: 'warning',
    inProgress: 'info',
    completed: 'success',
    canceled: 'secondary',
    rejected: 'secondary'
  };
  return severities[status] || 'secondary';
};

const statusTranslation = (status) => t(status ? `services.status.${status}` : 'common.all');
const typeTranslation = (type) => t(type ? `service-requests.types.${type}` : 'common.all');

const navigateToNew = () => router.push({ name: 'service-requests-new' });

const openTrackDrawer = (request) => {
  alert(`Tracking for ${request.id}: Status is ${statusTranslation(request.status)}. Technician: ${request.technicianName || 'Pending'}`);
};

const confirmCancel = (request) => {
  confirm.require({
    message: t('services.requests.confirm-cancel', { id: request.id }),
    header: t('services.requests.cancel-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => cancelRequest(request.id),
  });
};

// --- Review Logic ---
const displayReviewDialog = ref(false);
const currentServiceRequest = ref(null);
const reviewForm = ref({
  rating: 0,
  comment: ''
});
const existingReview = ref(null);

const openReviewDialog = async (request) => {
  currentServiceRequest.value = request;
  reviewForm.value = { rating: 0, comment: '' };
  existingReview.value = null;

  if (request.hasReview) {
    try {
      const response = await serviceApi.http.get(`/reviews/${request.reviewId}`);
      existingReview.value = response.data;
      reviewForm.value.rating = existingReview.value.rating;
      reviewForm.value.comment = existingReview.value.comment;
    } catch (e) {
      console.error("Failed to load existing review:", e);
    }
  }
  displayReviewDialog.value = true;
};

const submitReview = async () => {
  if (!currentServiceRequest.value || reviewForm.value.rating === 0) {
    alert("Please provide a rating.");
    return;
  }

  try {
    const reviewData = {
      serviceRequestId: currentServiceRequest.value.id,
      ownerId: currentOwnerId.value,
      technicianId: currentServiceRequest.value.technicianId,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
      createdAt: new Date().toISOString()
    };
    await serviceApi.createReview(reviewData);
    displayReviewDialog.value = false;
    await fetchServiceRequests(currentOwnerId.value); // Refresh list
    alert("Review submitted successfully!");
  } catch (e) {
    console.error("Failed to submit review:", e);
    alert("Error submitting review.");
  }
};
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('services.requests.my-requests') }}</h1>
      <pv-button :label="t('services.requests.new')" icon="pi pi-plus" severity="success" @click="navigateToNew" />
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-3 items-center">
      <span class="text-sm font-semibold">{{ t('common.filter-by') }}:</span>
      <pv-select-button v-model="filters.status" :options="['', 'pending', 'accepted', 'inProgress', 'completed', 'canceled', 'rejected']" :allowEmpty="true">
        <template #option="slotProps">{{ statusTranslation(slotProps.option) }}</template>
      </pv-select-button>
      <pv-select-button v-model="filters.type" :options="['', 'corrective', 'preventive']" :allowEmpty="true" class="ml-3">
        <template #option="slotProps">{{ typeTranslation(slotProps.option) }}</template>
      </pv-select-button>
    </div>

    <!-- Data Table -->
    <pv-data-table :value="filteredRequests" :loading="!requestsLoaded" striped-rows :rows="10" paginator table-style="min-width: 50rem">
      <pv-column field="id" :header="t('services.requests.id')" sortable style="width: 100px;"/>
      <pv-column field="createdAt" :header="t('services.requests.date')" sortable>
        <template #body="{ data }">{{ new Date(data.createdAt).toLocaleDateString() }}</template>
      </pv-column>
      <pv-column field="equipmentName" :header="t('services.requests.equipment')" sortable />
      <pv-column field="siteName" :header="t('services.requests.site')" sortable />
      <pv-column field="assignedToName" :header="t('services.requests.provider')" sortable />
      <pv-column field="type" :header="t('services.requests.type')">
        <template #body="{ data }">
          <pv-tag :value="typeTranslation(data.type)" :severity="data.type === 'corrective' ? 'danger' : 'warning'" />
        </template>
      </pv-column>
      <pv-column field="status" :header="t('services.requests.status')">
        <template #body="{ data }">
          <pv-tag :value="statusTranslation(data.status)" :severity="statusSeverity(data.status)" />
        </template>
      </pv-column>
      <pv-column :header="t('services.requests.actions')" style="width: 220px;">
        <template #body="{ data }">
          <pv-button icon="pi pi-search" text rounded severity="info" v-tooltip.top="t('services.requests.track-tooltip')" @click="openTrackDrawer(data)" />
          <pv-button v-if="data.status === 'completed' && !data.hasReview" label="Review" icon="pi pi-star" text rounded severity="warning" @click="openReviewDialog(data)" />
          <pv-button v-if="data.status === 'completed' && data.hasReview" label="View Review" icon="pi pi-eye" text rounded severity="info" @click="openReviewDialog(data)" />
          <pv-button v-if="data.status === 'completed' && data.reportUrl" icon="pi pi-file-pdf" text rounded severity="help" v-tooltip.top="t('services.requests.report-tooltip')" @click="openReport(data)" />
          <pv-button v-if="['pending', 'accepted'].includes(data.status)" icon="pi pi-times" text rounded severity="danger" v-tooltip.top="t('common.cancel-tooltip')" @click="confirmCancel(data)" />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">{{ t('common.error-occurred') }}: {{ errors.map(e => e.message).join(', ') }}</div>
    <pv-confirm-dialog/>

    <!-- Review Dialog -->
    <pv-dialog v-model:visible="displayReviewDialog" :header="currentServiceRequest && currentServiceRequest.hasReview ? 'View Review' : 'Submit Review'" :modal="true" class="p-fluid">
      <div class="field">
        <label for="rating">Rating</label>
        <pv-rating v-model="reviewForm.rating" :cancel="false" :readonly="currentServiceRequest && currentServiceRequest.hasReview" />
      </div>
      <div class="field mt-3">
        <label for="comment">Comment</label>
        <pv-textarea id="comment" v-model="reviewForm.comment" rows="5" :readonly="currentServiceRequest && currentServiceRequest.hasReview" />
      </div>
      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="displayReviewDialog = false" />
        <pv-button v-if="currentServiceRequest && !currentServiceRequest.hasReview" label="Submit" icon="pi pi-check" autofocus @click="submitReview" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
</style>