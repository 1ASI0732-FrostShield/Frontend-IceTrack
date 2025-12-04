<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'

const { t } = useI18n()
const configStore = useDashboardConfigStore()

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:visible', 'added'])

// Local state
const selectedCardType = ref(null)
const adding = ref(false)

// Computed
const availableTypes = computed(() => {
  if (!configStore.availableCardTypes.length) return []

  // Filter out already added cards
  const existingTypes = configStore.config?.cards.map(c => c.cardType) || []
  return configStore.availableCardTypes.filter(type => !existingTypes.includes(type))
})

const cardOptions = computed(() => {
  return availableTypes.value.map(type => ({
    value: type,
    label: t(`dashboard.cardTypes.${type}`) || type,
    icon: getCardIcon(type)
  }))
})

// Watch for visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedCardType.value = null
    if (!configStore.availableCardTypes.length) {
      configStore.loadAvailableCardTypes()
    }
  }
})

// Get card icon
function getCardIcon(cardType) {
  const iconMap = {
    'AlertsCard': 'pi-exclamation-triangle',
    'TemperatureMonitoringCard': 'pi-chart-line',
    'EquipmentStatusCard': 'pi-sitemap',
    'RecentReportsCard': 'pi-file',
    'ServiceRequestsCard': 'pi-briefcase'
  }
  return iconMap[cardType] || 'pi-th-large'
}

// Add card
async function addCard() {
  if (!selectedCardType.value) return

  adding.value = true

  // Calculate next order
  const nextOrder = configStore.config?.cards.length + 1 || 1

  const success = await configStore.addCard(selectedCardType.value, nextOrder)

  adding.value = false

  if (success) {
    emit('added')
    closeDialog()
  }
}

// Close dialog
function closeDialog() {
  emit('update:visible', false)
}
</script>

<template>
  <pv-dialog
      :visible="visible"
      :header="t('dashboard.addCard.title')"
      modal
      :style="{ width: '500px' }"
      @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-4 py-3">
      <div v-if="availableTypes.length === 0" class="text-center p-4">
        <i class="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
        <p class="text-600">
          {{ t('dashboard.addCard.allCardsAdded') }}
        </p>
      </div>

      <div v-else class="flex flex-column gap-3">
        <label for="cardType" class="font-semibold">
          {{ t('dashboard.addCard.selectType') }}
        </label>

        <div class="grid">
          <div
              v-for="option in cardOptions"
              :key="option.value"
              class="col-12"
          >
            <div
                class="card-option p-3 border-round cursor-pointer transition-colors transition-duration-200"
                :class="{ 'selected': selectedCardType === option.value }"
                @click="selectedCardType = option.value"
            >
              <div class="flex align-items-center gap-3">
                <pv-radio-button
                    :value="option.value"
                    v-model="selectedCardType"
                    :input-id="`card-${option.value}`"
                />
                <i :class="`pi ${option.icon} text-2xl`"></i>
                <div class="flex-1">
                  <label :for="`card-${option.value}`" class="font-semibold cursor-pointer">
                    {{ option.label }}
                  </label>
                  <p class="text-sm text-500 mt-1 mb-0">
                    {{ t(`dashboard.cardDescriptions.${option.value}`) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Errors -->
        <div v-if="configStore.errors.length > 0" class="p-3 surface-100 border-round border-1 border-red-500">
          <ul class="m-0 pl-3">
            <li v-for="(error, idx) in configStore.errors" :key="idx" class="text-red-600">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button
          :label="t('common.cancel')"
          text
          severity="secondary"
          @click="closeDialog"
          :disabled="adding"
      />
      <pv-button
          v-if="availableTypes.length > 0"
          :label="t('dashboard.addCard.add')"
          @click="addCard"
          :disabled="!selectedCardType"
          :loading="adding"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.card-option {
  border: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.card-option:hover {
  border-color: var(--primary-color);
  background: var(--primary-50);
}

.card-option.selected {
  border-color: var(--primary-color);
  background: var(--primary-100);
}
</style>