import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updatePrimaryPalette, updateSurfacePalette } from '@primeuix/themes'

const STORAGE_KEY = 'icetrack-visual-preferences'

const DEFAULT_PREFERENCES = {
  theme: 'default',
  titleSize: 'medium',
}

const allowedThemes = ['default', 'blue', 'green', 'purple', 'dark']
const allowedTitleSizes = ['small', 'medium', 'large']

const themeTokens = {
  default: {
    primary: '#0891b2',
    primaryContrast: '#ffffff',
    primarySoft: '#cffafe',
    primaryMuted: '#a5f3fc',
    primaryStrong: '#0e7490',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    bg: '#f0fdfa',
    surface: '#ffffff',
    surfaceMuted: '#ecfeff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#bae6fd',
    shadow: '0 4px 18px rgba(8, 145, 178, 0.12)',
    surfacePalette: '#f8fafc',
  },
  blue: {
    primary: '#2563eb',
    primaryContrast: '#ffffff',
    primarySoft: '#dbeafe',
    primaryMuted: '#bfdbfe',
    primaryStrong: '#1d4ed8',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    bg: '#eff6ff',
    surface: '#ffffff',
    surfaceMuted: '#dbeafe',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#bfdbfe',
    shadow: '0 4px 18px rgba(37, 99, 235, 0.12)',
    surfacePalette: '#f8fafc',
  },
  green: {
    primary: '#16a34a',
    primaryContrast: '#ffffff',
    primarySoft: '#dcfce7',
    primaryMuted: '#bbf7d0',
    primaryStrong: '#15803d',
    accent: '#0f766e',
    accentSoft: '#ccfbf1',
    bg: '#f0fdf4',
    surface: '#ffffff',
    surfaceMuted: '#dcfce7',
    text: '#102a1a',
    textMuted: '#4b6355',
    border: '#bbf7d0',
    shadow: '0 4px 18px rgba(22, 163, 74, 0.13)',
    surfacePalette: '#f8fafc',
  },
  purple: {
    primary: '#7c3aed',
    primaryContrast: '#ffffff',
    primarySoft: '#ede9fe',
    primaryMuted: '#ddd6fe',
    primaryStrong: '#6d28d9',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    bg: '#f5f3ff',
    surface: '#ffffff',
    surfaceMuted: '#ede9fe',
    text: '#1f1637',
    textMuted: '#665c7c',
    border: '#ddd6fe',
    shadow: '0 4px 18px rgba(124, 58, 237, 0.13)',
    surfacePalette: '#f8fafc',
  },
  dark: {
    primary: '#60a5fa',
    primaryContrast: '#0f172a',
    primarySoft: '#1e3a5f',
    primaryMuted: '#1d4ed8',
    primaryStrong: '#93c5fd',
    accent: '#22d3ee',
    accentSoft: '#164e63',
    bg: '#0f172a',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    text: '#f8fafc',
    textMuted: '#cbd5e1',
    border: '#334155',
    shadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    surfacePalette: '#111827',
  },
}

const titleSizeTokens = {
  small: {
    title: '1.35rem',
    sectionTitle: '1.1rem',
  },
  medium: {
    title: '1.6rem',
    sectionTitle: '1.25rem',
  },
  large: {
    title: '2rem',
    sectionTitle: '1.5rem',
  },
}

function normalizePreferences(preferences = {}) {
  const theme = allowedThemes.includes(preferences.theme)
    ? preferences.theme
    : DEFAULT_PREFERENCES.theme

  const titleSize = allowedTitleSizes.includes(preferences.titleSize)
    ? preferences.titleSize
    : DEFAULT_PREFERENCES.titleSize

  return { theme, titleSize }
}

export const useVisualPreferencesStore = defineStore('visualPreferences', () => {
  const theme = ref(DEFAULT_PREFERENCES.theme)
  const titleSize = ref(DEFAULT_PREFERENCES.titleSize)

  function setCssVariable(name, value) {
    document.documentElement.style.setProperty(name, value)
  }

  function applyPreferences() {
    const selectedTheme = themeTokens[theme.value]
    const selectedTitleSize = titleSizeTokens[titleSize.value]

    document.documentElement.dataset.appTheme = theme.value
    document.documentElement.dataset.titleSize = titleSize.value
    document.documentElement.style.colorScheme = theme.value === 'dark' ? 'dark' : 'light'

    setCssVariable('--app-primary', selectedTheme.primary)
    setCssVariable('--app-primary-contrast', selectedTheme.primaryContrast)
    setCssVariable('--app-primary-soft', selectedTheme.primarySoft)
    setCssVariable('--app-primary-muted', selectedTheme.primaryMuted)
    setCssVariable('--app-primary-strong', selectedTheme.primaryStrong)
    setCssVariable('--app-accent', selectedTheme.accent)
    setCssVariable('--app-accent-soft', selectedTheme.accentSoft)
    setCssVariable('--app-bg', selectedTheme.bg)
    setCssVariable('--app-surface', selectedTheme.surface)
    setCssVariable('--app-surface-muted', selectedTheme.surfaceMuted)
    setCssVariable('--app-text', selectedTheme.text)
    setCssVariable('--app-text-muted', selectedTheme.textMuted)
    setCssVariable('--app-border', selectedTheme.border)
    setCssVariable('--app-card-shadow', selectedTheme.shadow)
    setCssVariable('--app-title-size', selectedTitleSize.title)
    setCssVariable('--app-section-title-size', selectedTitleSize.sectionTitle)

    setCssVariable('--p-primary-color', selectedTheme.primary)
    setCssVariable('--p-primary-hover-color', selectedTheme.primaryStrong)
    setCssVariable('--p-primary-active-color', selectedTheme.primaryStrong)
    setCssVariable('--p-primary-contrast-color', selectedTheme.primaryContrast)
    setCssVariable('--p-highlight-background', selectedTheme.primarySoft)
    setCssVariable('--p-highlight-color', selectedTheme.primaryStrong)
    setCssVariable('--p-content-background', selectedTheme.surface)
    setCssVariable('--p-content-color', selectedTheme.text)
    setCssVariable('--p-text-color', selectedTheme.text)
    setCssVariable('--p-text-muted-color', selectedTheme.textMuted)
    setCssVariable('--p-surface-0', selectedTheme.surface)
    setCssVariable('--p-surface-50', selectedTheme.bg)
    setCssVariable('--p-surface-100', selectedTheme.surfaceMuted)
    setCssVariable('--p-surface-200', selectedTheme.border)
    setCssVariable('--primary-color', selectedTheme.primary)
    setCssVariable('--primary-50', selectedTheme.primarySoft)
    setCssVariable('--primary-100', selectedTheme.primarySoft)
    setCssVariable('--surface-ground', selectedTheme.bg)
    setCssVariable('--surface-card', selectedTheme.surface)
    setCssVariable('--surface-border', selectedTheme.border)
    setCssVariable('--text-color', selectedTheme.text)
    setCssVariable('--text-color-secondary', selectedTheme.textMuted)

    updatePrimaryPalette(selectedTheme.primary)
    updateSurfacePalette(selectedTheme.surfacePalette)
  }

  function persistPreferences() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: theme.value,
        titleSize: titleSize.value,
      })
    )
  }

  function loadPreferences() {
    const storedPreferences = localStorage.getItem(STORAGE_KEY)

    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences)
        const normalizedPreferences = normalizePreferences(parsedPreferences)
        theme.value = normalizedPreferences.theme
        titleSize.value = normalizedPreferences.titleSize
      } catch (error) {
        console.warn('Invalid visual preferences found. Using defaults.', error)
      }
    }

    applyPreferences()
  }

  function setTheme(nextTheme) {
    theme.value = normalizePreferences({ theme: nextTheme, titleSize: titleSize.value }).theme
    persistPreferences()
    applyPreferences()
  }

  function setTitleSize(nextTitleSize) {
    titleSize.value = normalizePreferences({ theme: theme.value, titleSize: nextTitleSize }).titleSize
    persistPreferences()
    applyPreferences()
  }

  function resetPreferences() {
    theme.value = DEFAULT_PREFERENCES.theme
    titleSize.value = DEFAULT_PREFERENCES.titleSize
    persistPreferences()
    applyPreferences()
  }

  return {
    theme,
    titleSize,
    loadPreferences,
    setTheme,
    setTitleSize,
    resetPreferences,
  }
})
