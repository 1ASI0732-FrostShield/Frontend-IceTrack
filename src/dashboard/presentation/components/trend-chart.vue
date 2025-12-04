<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'
import 'chart.js/auto'

const props = defineProps({
  chartData: {
    type: Object,
    default: null
  }
})

const hasValidData = computed(() => {
  return props.chartData &&
      props.chartData.datasets?.[0]?.data?.length > 0
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => `${context.parsed.y.toFixed(1)} °C`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      }
    },
    y: {
      display: true,
      beginAtZero: false,
      ticks: {
        callback: (value) => `${value} °C`
      }
    }
  }
}))
</script>

<template>
  <div>
    <Chart
        v-if="hasValidData"
        type="line"
        :data="chartData"
        :options="chartOptions"
        class="h-20rem"
    />

    <div v-else class="flex flex-column align-items-center justify-content-center h-20rem surface-100 border-round">
      <i class="pi pi-chart-line text-6xl text-400 mb-3"></i>
      <span class="text-500 text-center px-3">
        No temperature trend data available
      </span>
      <span class="text-400 text-sm mt-2">
        This endpoint is not implemented in the backend yet
      </span>
    </div>
  </div>
</template>