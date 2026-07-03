import es from './locales/es.json'

const messages = es

export function t(key, params = {}) {
  const value = key.split('.').reduce((obj, k) => (obj != null ? obj[k] : undefined), messages)
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] != null ? params[k] : `{${k}}`)
  }
  return key
}

export function useI18n() {
  return { t }
}

export default {
  install(app) {
    app.config.globalProperties.$t = t
  }
}
