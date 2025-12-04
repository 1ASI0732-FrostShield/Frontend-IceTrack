<script setup>
import {ref, onMounted, computed} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { FilterMatchMode } from '@primevue/core/api'
import useReportingStore from '@/reporting/application/reporting.store.js'

const { t } = useI18n()
const router = useRouter()
const confirm = useConfirm()
const store = useReportingStore()
const { reports, reportsLoaded, errors, fetchReports, deleteReport } = store

const loading = ref(true)

onMounted(() => {
  if (!reportsLoaded.value) {
    fetchReports()
  }
  loading.value = false
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS }
})

const statusOptions = computed(() => [
  { label: t('reports.list.statusFilter.completed'), value: 'Completed' },
  { label: t('reports.list.statusFilter.inProgress'), value: 'InProgress' },
  { label: t('reports.list.statusFilter.canceled'), value: 'Canceled' }
])

const typeOptions = computed(() => [
  { label: t('reports.list.typesFilter.inspection'), value: 'Inspection' },
  { label: t('reports.list.typesFilter.maintenance'), value: 'Maintenance' },
  { label: t('reports.list.typesFilter.incident'), value: 'Incident' },
  { label: t('reports.list.typesFilter.audit'), value: 'Audit' },
])

const getSeverity = (status) => {
  switch (status) {
    case 'Completed': return 'success'
    case 'InProgress': return 'warning'
    case 'Canceled': return 'danger'
    default: return 'secondary'
  }
}

const navigateToNew = () => {
  router.push({ name: 'reporting-report-new' })
}

const navigateToDetails = (id) => {
  router.push({ name: 'reporting-report-detail', params: { id } })
}

const confirmDelete = (report) => {
  confirm.require({
    message: t('reports.list.confirm-delete', { name: report.title }),
    header: t('reports.list.delete-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteReport(report)
    }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return isNaN(date) ? '—' : date.toLocaleString()
}
</script>

<template>
  <div class="p-4">
    <h1>{{ t('reports.list.title') }}</h1>

    <pv-button
        :label="t('reports.list.new')"
        icon="pi pi-plus"
        class="mb-3"
        @click="navigateToNew"
    />

    <pv-data-table
        v-model:filters="filters"
        :value="reports"
        dataKey="id"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        :loading="loading"
        filterDisplay="row"
        :globalFilterFields="['title', 'type', 'status']"
        tableStyle="min-width: 60rem"
    >
      <template #header>
        <div class="flex justify-end">
          <pv-icon-field>
            <pv-input-icon>
              <i class="pi pi-search" />
            </pv-input-icon>
            <pv-input-text v-model="filters['global'].value" :placeholder="t('reports.list.search')" />
          </pv-icon-field>
        </div>
      </template>

      <template #empty> No se encontraron reportes. </template>
      <template #loading> Cargando reportes... </template>

      <pv-column field="title" :header="t('reports.list.name')" style="min-width: 14rem">
        <template #filter="{ filterModel, filterCallback }">
          <pv-input-text
              v-model="filterModel.value"
              @input="filterCallback()"
              :placeholder="t('reports.list.label.search')"
          />
        </template>
      </pv-column>

      <pv-column field="type" :header="t('reports.list.type')" style="min-width: 12rem">
        <template #filter="{ filterModel, filterCallback }">
          <pv-select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('reports.list.label.type')"
              :showClear="true"
              style="width: 100%"
          />
        </template>
      </pv-column>

      <pv-column field="generatedAt" :header="t('reports.list.date')" style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDate(data.generatedAt) }}
        </template>
      </pv-column>

      <pv-column field="status" :header="t('reports.list.status')" style="min-width: 12rem">
        <template #body="{ data }">
          <pv-tag :value="data.status" :severity="getSeverity(data.status)" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <pv-select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="t('reports.list.label.status')"
              :showClear="true"
              style="width: 100%"
          />
        </template>
      </pv-column>

      <pv-column :header="t('reports.list.actions')" style="min-width: 10rem">
        <template #body="{ data }">
          <pv-button
              type="button"
              :label="t('reports.list.action.view')"
              icon="pi pi-eye"
              outlined
              @click="navigateToDetails(data.id)"
          />
          <pv-button
              type="button"
              icon="pi pi-trash"
              rounded
              severity="danger"
              text
              @click="confirmDelete(data)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('common.error-occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 1rem;
}
</style>
