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

onMounted(async () => {
  loading.value = true

  if (!store.reportsLoaded) {
    await store.fetchReports()
  }

  const found = store.reports.find(r => r.id === id)

  if (found) {
    report.value = new Report(found)
  } else {
    console.warn('Reporte no encontrado')
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
    <h2 class="text-lg font-bold mb-3">Detalle del Reporte</h2>

    <div v-if="loading">Cargando...</div>
    <div v-else-if="!report">Reporte no encontrado</div>
    <div v-else>

      <div v-if="!editMode">
        <p><strong>Título:</strong> {{ report.title }}</p>
        <p><strong>Tipo:</strong> {{ report.type }}</p>
        <p><strong>Estado:</strong> {{ report.status }}</p>
        <p>
          <strong>Generado el:</strong>
          {{
            report.generatedAt instanceof Date
                ? report.getFormatedGeneratedAt()
                : report.generatedAt
          }}
        </p>

        <pv-button
            label="Editar"
            icon="pi pi-pencil"
            class="mt-3"
            @click="editMode = true"
        />
        <pv-button
            label="Volver"
            icon="pi pi-arrow-left"
            class="mt-3 ml-2"
            @click="router.back()"
        />
      </div>

      <div v-else>
        <div class="flex flex-col gap-3">
          <div>
            <label>Título</label>
            <pv-input-text v-model="report.title" class="w-full" />
          </div>

          <div>
            <label>Tipo</label>
            <pv-input-text v-model="report.type" class="w-full" />
          </div>

          <div>
            <label>Estado</label>
            <pv-input-text v-model="report.status" class="w-full" />
          </div>
        </div>

        <div class="mt-4">
          <pv-button
              label="Guardar"
              icon="pi pi-check"
              class="p-button-success"
              @click="saveChanges"
          />
          <pv-button
              label="Cancelar"
              icon="pi pi-times"
              class="ml-2 p-button-secondary"
              @click="editMode = false"
          />
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
