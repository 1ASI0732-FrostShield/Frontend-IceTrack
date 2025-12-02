<script setup>
import {computed, ref} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useReportingStore from '@/reporting/application/reporting.store.js'

const { t } = useI18n()
const router = useRouter()
const store = useReportingStore()
const { addReport } = store

const title = ref('')
const type = ref('')
const summary = ref('')
const content = ref('')
const status = ref('In Progress')

const typeOptions = computed(() => [
  { label: t('reports.list.typesFilter.inspection'), value: 'Inspection' },
  { label: t('reports.list.typesFilter.maintenance'), value: 'Maintenance' },
  { label: t('reports.list.typesFilter.incident'), value: 'Incident' },
  { label: t('reports.list.typesFilter.audit'), value: 'Audit' },
])

const errors = ref([])

const saveReport = async () => {
  errors.value = []
  if (!title.value || !type.value || !summary.value || !content.value || !status.value) {
    errors.value.push({ message: t('reports.form.validation-required') })
    return
  }

  try {
    await addReport({
      title: title.value,
      type: type.value,
      summary: summary.value,
      content: content.value,
      status: status.value,
      generatedAt: new Date().toISOString()
    })
    router.push({ name: 'reporting-report' })
  } catch (err) {
    errors.value.push({ message: err.message || 'Error al guardar el reporte' })
  }
}
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="mb-6 text-xl font-bold">{{ t('reports.list.create.start') }}</h1>

    <div class="mb-4">
      <pv-input-text v-model="title" :placeholder="t('reports.list.detail.title')" class="w-full"/>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <pv-select v-model="type" :options="typeOptions" optionLabel="label" optionValue="value" :placeholder="t('reports.list.label.type')"
          :showClear="true" class="w-full"/>
      <pv-input-text v-model="summary" :placeholder="t('reports.list.detail.summary')" class="w-full"/>
    </div>

    <div class="mb-6">
      <pv-textarea v-model="content" :placeholder="t('reports.list.detail.content')" autoResize
                   rows="6" class="w-full"/>
    </div>

    <div class="flex flex-wrap gap-3">
      <pv-button :label="t('reports.list.detail.save')" icon="pi pi-check" @click="saveReport"/>
      <pv-button :label="t('reports.list.detail.cancel')" icon="pi pi-times" severity="secondary" @click="router.back()"/>
    </div>

    <div v-if="errors.length" class="text-red-500 mt-4">
      {{ t('common.error-occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>