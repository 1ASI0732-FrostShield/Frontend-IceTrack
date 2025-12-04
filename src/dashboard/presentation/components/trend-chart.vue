<script setup>
import { computed } from 'vue'
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

const noDataMessage = computed(() => {
  return 'Sin datos de tendencia disponibles'
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
    <pv-chart
        v-if="hasValidData"
        type="line"
        :data="chartData"
        :options="chartOptions"
        class="h-20rem"
    />
    <div v-else class="flex align-items-center justify-content-center h-20rem">
      <span class="text-500">
        {{ noDataMessage }}
      </span>
    </div>
  </div>
</template>