<script setup>
defineOptions({ name: 'ConfigurationsPage' })

import { computed } from 'vue'
import { useI18n } from '@/i18n.js'
import { useVisualPreferencesStore } from '@/shared/application/visual-preferences.store.js'

const { t } = useI18n()
const visualPreferencesStore = useVisualPreferencesStore()

const themeOptions = computed(() => [
  { label: t('configurations.themes.default'), value: 'default' },
  { label: t('configurations.themes.blue'), value: 'blue' },
  { label: t('configurations.themes.green'), value: 'green' },
  { label: t('configurations.themes.purple'), value: 'purple' },
  { label: t('configurations.themes.dark'), value: 'dark' },
])

const titleSizeOptions = computed(() => [
  { label: t('configurations.titleSizes.small'), value: 'small' },
  { label: t('configurations.titleSizes.medium'), value: 'medium' },
  { label: t('configurations.titleSizes.large'), value: 'large' },
])
</script>

<template>
  <section class="config-page">
    <div class="config-header">
      <div>
        <h1 class="config-title">{{ t('configurations.title') }}</h1>
        <p class="config-subtitle">{{ t('configurations.subtitle') }}</p>
      </div>

      <pv-button
          :label="t('configurations.reset')"
          icon="pi pi-refresh"
          outlined
          severity="secondary"
          @click="visualPreferencesStore.resetPreferences"
      />
    </div>

    <div class="config-grid">
      <pv-card class="config-panel">
        <template #title>
          <div class="config-panel-title">
            <i class="pi pi-palette"></i>
            <span>{{ t('configurations.themeTitle') }}</span>
          </div>
        </template>

        <template #content>
          <div class="config-option-grid">
            <button
                v-for="option in themeOptions"
                :key="option.value"
                type="button"
                class="theme-option"
                :class="[`theme-option--${option.value}`, { 'is-selected': visualPreferencesStore.theme === option.value }]"
                @click="visualPreferencesStore.setTheme(option.value)"
            >
              <span class="theme-swatch"></span>
              <span class="theme-label">{{ option.label }}</span>
              <i v-if="visualPreferencesStore.theme === option.value" class="pi pi-check"></i>
            </button>
          </div>
        </template>
      </pv-card>

      <pv-card class="config-panel">
        <template #title>
          <div class="config-panel-title">
            <i class="pi pi-text-height"></i>
            <span>{{ t('configurations.titleSizeTitle') }}</span>
          </div>
        </template>

        <template #content>
          <pv-select-button
              :model-value="visualPreferencesStore.titleSize"
              :options="titleSizeOptions"
              option-label="label"
              option-value="value"
              class="title-size-control"
              @update:model-value="visualPreferencesStore.setTitleSize"
          />
        </template>
      </pv-card>
    </div>

    <pv-card class="config-preview">
      <template #title>
        <span>{{ t('configurations.previewTitle') }}</span>
      </template>

      <template #content>
        <div class="preview-surface">
          <div>
            <h2>{{ t('dashboard.title') }}</h2>
            <p>{{ t('dashboard.subtitle') }}</p>
          </div>

          <div class="preview-actions">
            <pv-button :label="t('common.save')" icon="pi pi-check" />
            <pv-button :label="t('common.cancel')" icon="pi pi-times" outlined severity="secondary" />
          </div>
        </div>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.config-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.config-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.config-title {
  margin: 0;
  color: var(--app-text);
  font-size: var(--app-title-size);
  font-weight: 600;
}

.config-subtitle {
  margin: 0.25rem 0 0;
  color: var(--app-text-muted);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.config-panel,
.config-preview {
  border: 1px solid var(--app-border);
}

.config-panel-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--app-text);
}

.config-option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  min-height: 44px;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.theme-option:hover,
.theme-option.is-selected {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-primary), transparent 75%);
}

.theme-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--app-border);
  flex: 0 0 auto;
}

.theme-label {
  flex: 1;
}

.theme-option--default .theme-swatch { background: linear-gradient(135deg, #f8fafc 0%, #2563eb 100%); }
.theme-option--blue .theme-swatch { background: #2563eb; }
.theme-option--green .theme-swatch { background: #16a34a; }
.theme-option--purple .theme-swatch { background: #7c3aed; }
.theme-option--dark .theme-swatch { background: #111827; }

.title-size-control {
  max-width: 100%;
}

.preview-surface {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--app-bg);
  border: 1px solid var(--app-border);
}

.preview-surface h2 {
  margin: 0;
  color: var(--app-text);
  font-size: var(--app-section-title-size);
}

.preview-surface p {
  margin: 0.25rem 0 0;
  color: var(--app-text-muted);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 860px) {
  .config-header,
  .preview-surface {
    flex-direction: column;
    align-items: stretch;
  }

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
