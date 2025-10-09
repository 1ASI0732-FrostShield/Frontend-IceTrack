import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import i18n from './i18n.js'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import 'primeicons/primeicons.css'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Chart from 'primevue/chart'
import {createPinia} from "pinia";
import 'primeflex/primeflex.css'

const AuraBlue = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
})

createApp(App)
    .use(i18n)
    .use(createPinia())
    .use(PrimeVue, {
        ripple: true,
        theme: {
            preset: AuraBlue,
            options: { darkModeSelector: false }
        }
    })
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-tag', Tag)
    .component('pv-chart', Chart)
    .component('pv-data-table', DataTable)
    .component('pv-column', Column)
    .use(router)
    .mount('#app')
