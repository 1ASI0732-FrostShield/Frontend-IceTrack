<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import useReportingStore from '@/reporting/application/reporting.store.js'
import { Report } from "@/reporting/domain/model/report.entity.js"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useReportingStore()

const report = ref(null)
const loading = ref(true)
const editMode = ref(false)

const id = route.params.id

const statusOptions = [
  { label: 'Canceled', value: 'Canceled' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' }
]

onMounted(async () => {
  loading.value = true

  if (!store.reportsLoaded) {
    await store.fetchReports()
  }

  const found = store.reports.find(r => r.id === Number(id))

  if (found) {
    report.value = new Report(found)
  } else {
    console.warn('Report not found')
  }

  loading.value = false
})

const saveChanges = () => {
  store.updateReport(report.value)
  editMode.value = false
}
</script>

<template>
  <div class="p-4">
    <h1>{{ t('reports.list.detail.start') }}</h1>

    <br>

    <div v-if="loading">Loading...</div>
    <div v-else-if="!report">Report not found</div>
    <div v-else>

      <div v-if="!editMode">
        <p><strong>{{ t('reports.list.detail.title') }}:</strong> {{ report.title }}</p>
        <p><strong>{{ t('reports.list.detail.type') }}:</strong> {{ report.type }}</p>
        <p><strong>{{ t('reports.list.detail.status') }}:</strong> {{ report.status }}</p>
        <p><strong>{{ t('reports.list.detail.summary') }}:</strong> {{ report.summary }}</p>
        <p><strong>{{ t('reports.list.detail.content') }}:</strong></p>
        <p class="whitespace-pre-line">{{ report.content }}</p>

        <p>
          <strong>{{ t('reports.list.detail.generatedAt') }}:</strong>
          {{
            report.generatedAt instanceof Date
                ? report.getFormatedGeneratedAt()
                : report.generatedAt
          }}
        </p>

        <pv-button :label="t('reports.list.detail.edit')" icon="pi pi-pencil" class="mt-3" @click="editMode = true"/>
        <pv-button :label="t('reports.list.detail.back')" icon="pi pi-arrow-left" class="mt-3 ml-2" @click="router.back()"/>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="mt-12" style="width: 85%;">
            <label class="block mb-2">{{ t('reports.list.detail.title') }}</label>
            <pv-input-text v-model="report.title" class="p-inputtext-lg" style="width: 40%;
            height: 3rem;"/>
          </div>

          <div class="mt-12" style="width: 85%;">
            <label class="block mb-2">{{ t('reports.list.detail.type') }}</label>
            <pv-input-text v-model="report.type" class="p-inputtext-lg" style="width: 40%;
            height: 3rem;"/>
          </div>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div class="mt-12" style="width: 10%;">
            <label class="block mb-2">{{ t('reports.list.detail.status') }}</label>
            <pv-select v-model="report.status" :options="statusOptions" optionLabel="label"
                optionValue="value" placeholder="Seleccionar estado" style="width: 100%; height: 3rem;"/>
          </div>

          <div class="mt-12" style="width: 85%;">
            <label class="block mb-2">{{ t('reports.list.detail.summary') }}</label>
            <pv-textarea v-model="report.summary" autoResize rows="5"
                style="width: 80%; min-height: 8rem; padding: 1rem;"/>
          </div>
        </div>

        <div class="mt-8">
          <label class="block mb-2">{{ t('reports.list.detail.content') }}</label>
          <pv-textarea v-model="report.content" autoResize rows="12"
              class="w-full" style="font-size: 1.05rem; padding: 1rem; min-height: 14rem;"/>
        </div>

        <!-- Buttons -->
        <div class="mt-8">
          <pv-button :label="t('reports.list.detail.save')" icon="pi pi-check" class="p-button-success" @click="saveChanges"/>
          <pv-button :label="t('reports.list.detail.cancel')" icon="pi pi-times" class="ml-2 p-button-secondary" @click="editMode = false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
}
</style>
