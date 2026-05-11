<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  initialLat: {
    type: Number,
    default: -12.046374,
  },
  initialLng: {
    type: Number,
    default: -77.042793,
  },
  initialZoom: {
    type: Number,
    default: 13,
  },

  // Recibe ubicación actual
  currentLocation: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['location-selected']);

const mapContainer = ref(null);
let map = null;
let marker = null;

const selectedLocation = ref({
  lat: props.initialLat,
  lng: props.initialLng,
  name: '',
  address: '',
});

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    if (data && data.address) {
      const address = data.address;
      const displayName = data.display_name;

      const formattedAddress = [
        address.road,
        address.house_number,
        address.suburb,
        address.city || address.town || address.village,
        address.state,
        address.postcode,
        address.country
      ].filter(Boolean).join(', ');

      selectedLocation.value.name = displayName;
      selectedLocation.value.address = formattedAddress;
      emit('location-selected', selectedLocation.value);
    } else {
      selectedLocation.value.name = `${lat}, ${lng}`;
      selectedLocation.value.address = `${lat}, ${lng}`;
      emit('location-selected', selectedLocation.value);
    }
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    selectedLocation.value.name = `${lat}, ${lng}`;
    selectedLocation.value.address = `${lat}, ${lng}`;
    emit('location-selected', selectedLocation.value);
  }
};

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([props.initialLat, props.initialLng], props.initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    marker = L.marker([props.initialLat, props.initialLng], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {
      const { lat, lng } = event.target.getLatLng();
      selectedLocation.value.lat = lat;
      selectedLocation.value.lng = lng;
      reverseGeocode(lat, lng);
    });

    reverseGeocode(props.initialLat, props.initialLng);
  }
});

// Envia la ubicación actual
watch(
    () => props.currentLocation,
    (location) => {
      if (!location || !map || !marker) return;

      const { lat, lng } = location;

      selectedLocation.value.lat = lat;
      selectedLocation.value.lng = lng;

      // Mueve el mapa a ubicación actual
      map.setView([lat, lng], 16);

      // Mueve el marcador a ubicación actual
      marker.setLatLng([lat, lng]);

      // Obtiene dirección real
      reverseGeocode(lat, lng);
    }
);

onBeforeUnmount(() => {
  if (map) {
    map.remove();
  }
});
</script>

<template>
  <div class="map-picker-container">
    <div ref="mapContainer" class="map-container"></div>
    <div class="location-info mt-2">
      <p><strong>{{ t('map.selected-location') }}:</strong> {{ selectedLocation.name }}</p>
      <p><strong>{{ t('map.address') }}:</strong> {{ selectedLocation.address }}</p>
      <p><strong>{{ t('map.coordinates') }}:</strong> {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}</p>
    </div>
  </div>
</template>

<style scoped>
.map-picker-container {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
}
.map-container {
  flex-grow: 1;
  height: 100%;
  z-index: 1;
}
</style>
