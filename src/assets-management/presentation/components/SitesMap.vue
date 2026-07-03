<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  sites: { type: Array, required: true },
})

const mapContainer = ref(null)
let map = null
let markersLayer = null

const loading = ref(false)
const geocodeErrors = ref([])
const resolvedCount = ref(0)
const totalCount = ref(0)

const addressCache = ref({})

const PERU_CENTER = [-9.19, -75.0152]
const PERU_ZOOM = 5

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  const response = await fetch(url)
  const data = await response.json()
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  }
  return null
}

async function loadMarkers() {
  loading.value = true
  geocodeErrors.value = []
  const markers = []
  resolvedCount.value = 0
  totalCount.value = props.sites.length

  for (let i = 0; i < props.sites.length; i++) {
    const site = props.sites[i]
    const cached = addressCache.value[site.address]

    if (cached) {
      markers.push({ lat: cached.lat, lng: cached.lng, site })
      resolvedCount.value++
      continue
    }

    try {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      const coords = await geocodeAddress(site.address)
      if (coords) {
        addressCache.value[site.address] = coords
        markers.push({ lat: coords.lat, lng: coords.lng, site })
      } else {
        geocodeErrors.value.push(`${site.name}: dirección no encontrada`)
      }
    } catch {
      geocodeErrors.value.push(`${site.name}: error de geocodificación`)
    }
    resolvedCount.value++
  }

  renderMarkers(markers)
  loading.value = false
}

function renderMarkers(markers) {
  if (!map) return
  if (markersLayer) map.removeLayer(markersLayer)

  markersLayer = L.layerGroup().addTo(map)

  if (markers.length === 0) return

  markers.forEach(({ lat, lng, site }) => {
    L.marker([lat, lng])
      .addTo(markersLayer)
      .bindPopup(`<strong>${site.name}</strong><br>${site.address}`)
  })

  const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
  map.fitBounds(bounds, { padding: [50, 50] })
}

watch(() => props.sites?.length, () => {
  if (map) loadMarkers()
})

onMounted(() => {
  if (!mapContainer.value) return
  map = L.map(mapContainer.value).setView(PERU_CENTER, PERU_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  if (props.sites.length) loadMarkers()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="sites-map-wrapper">
    <div v-if="loading" class="sites-map-loading">
      <i class="pi pi-spin pi-spinner" />
      Geocodificando sitios... {{ resolvedCount }}/{{ totalCount }}
    </div>

    <div
      ref="mapContainer"
      class="sites-map-container"
      :class="{ 'sites-map-container--loading': loading }"
    ></div>

    <div v-if="geocodeErrors.length" class="sites-map-errors">
      <small v-for="(err, i) in geocodeErrors" :key="i">
        <i class="pi pi-exclamation-triangle" /> {{ err }}
      </small>
    </div>

    <div v-if="!loading && !props.sites.length" class="sites-map-empty">
      No hay sitios registrados para mostrar en el mapa.
    </div>
  </div>
</template>

<style scoped>
.sites-map-wrapper {
  width: 100%;
  margin-bottom: 2rem;
}

.sites-map-container {
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  border: 0.5px solid var(--app-border);
  z-index: 1;
}

.sites-map-container--loading {
  opacity: 0.5;
}

.sites-map-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--app-text-muted);
  background: var(--app-surface-muted);
  border-radius: 8px 8px 0 0;
}

.sites-map-errors {
  padding: 6px 12px;
  font-size: 11px;
  color: #A32D2D;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sites-map-empty {
  padding: 2rem;
  text-align: center;
  font-size: 13px;
  color: var(--app-text-muted);
}
</style>
