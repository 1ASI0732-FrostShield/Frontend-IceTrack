<script setup>
import { computed } from 'vue'

const props = defineProps({
  kpis: {
    type: Object,
    default: null
  }
})

const formattedAvgTemperature = computed(() => {
  if (!props.kpis || props.kpis.avgTemperature === 0) return '--'
  return props.kpis.getFormattedAvgTemp()
})

const hasData = computed(() => {
  return props.kpis && props.kpis.hasData()
})
</script>

<template>
  <div class="grid">
    <!-- Equipment Card -->
    <div class="col-12 md:col-6 lg:col-3">
      <pv-card>
        <template #title>
          <div class="flex align-items-center justify-content-between w-full">
            <span>{{ $t('dashboard.kpis.equipments') }}</span>
            <i class="pi pi-sitemap" aria-hidden="true" title="Equipos"></i>
          </div>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-primary">
            {{ kpis?.totalEquipments ?? '--' }}
          </div>
          <div v-if="!hasData" class="text-sm text-500 mt-2">
            {{ $t('dashboard.noData') }}
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Alerts Card -->
    <div class="col-12 md:col-6 lg:col-3">
      <pv-card>
        <template #title>
          <div class="flex align-items-center justify-content-between w-full">
            <span>{{ $t('dashboard.kpis.alerts') }}</span>
            <i class="pi pi-exclamation-triangle" aria-hidden="true" title="Alertas"></i>
          </div>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-orange-500">
            {{ kpis?.openAlerts ?? '--' }}
          </div>
          <div v-if="!hasData" class="text-sm text-500 mt-2">
            {{ $t('dashboard.noData') }}
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Service Requests Card -->
    <div class="col-12 md:col-6 lg:col-3">
      <pv-card>
        <template #title>
          <div class="flex align-items-center justify-content-between w-full">
            <span>{{ $t('dashboard.kpis.orders') }}</span>
            <i class="pi pi-briefcase" aria-hidden="true" title="Órdenes"></i>
          </div>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-green-500">
            {{ kpis?.activeRequests ?? '--' }}
          </div>
          <div v-if="!hasData" class="text-sm text-500 mt-2">
            {{ $t('dashboard.noData') }}
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Temperature Card -->
    <div class="col-12 md:col-6 lg:col-3">
      <pv-card>
        <template #title>
          <div class="flex align-items-center justify-content-between w-full">
            <span>{{ $t('dashboard.kpis.avgTemp') }}</span>
            <i class="pi pi-chart-scatter" aria-hidden="true" title="Temperatura"></i>
          </div>
        </template>
        <template #content>
          <div class="text-3xl font-bold text-blue-500">
            {{ formattedAvgTemperature }}
          </div>
          <div v-if="!hasData" class="text-sm text-500 mt-2">
            {{ $t('dashboard.noData') }}
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>