<script setup>
import { computed } from 'vue'

const props = defineProps({
  snapshot: {
    type: Object,
    default: null
  }
})

const formattedAvgTemperature = computed(() => {
  if (!props.snapshot) return '-'
  const avg = props.snapshot.avgTemperature
  return avg ? `${avg.toFixed(1)} °C` : '-'
})
</script>

<template>
  <div class="grid">
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
            {{ snapshot?.kpis?.totalEquipments ?? '-' }}
          </div>
        </template>
      </pv-card>
    </div>

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
            {{ snapshot?.kpis?.openAlerts ?? '-' }}
          </div>
        </template>
      </pv-card>
    </div>

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
            {{ snapshot?.kpis?.activeRequests ?? '-' }}
          </div>
        </template>
      </pv-card>
    </div>

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
        </template>
      </pv-card>
    </div>
  </div>
</template>