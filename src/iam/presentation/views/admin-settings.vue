<script setup>

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const notifications = ref({
  sms: true,
  email: false,
  calls: false,
  social: true
})

const alarm = ref('bells')

const alarmOptions = computed(() => [
  { label: t('admin.settings.alarm.bells'), value: 'bells' },
  { label: t('admin.settings.alarm.chime'), value: 'chime' },
  { label: t('admin.settings.alarm.pop'), value: 'pop' },
  { label: t('admin.settings.alarm.none'), value: 'none' }
])

</script>

<template>
  <section>
    <div class="px-7 py-3 flex items-center">
      <h1 class="text-10 font-semibold flex-1">{{ t('admin.settings.title') }}</h1>

      <div class="flex gap-2">
        <RouterLink :to="{ name: 'admin-users' }">
          <pv-button :label="t('admin.users.title')" />
        </RouterLink>
      </div>
    </div>
  </section>

  <section class="space-y-6">
   <!-- Modo de Luz -->
    <div class="px-7">
      <p class="text-xl font-semibold text-black"> {{ t('admin.settings.lightMode') }}</p>

      <div class="p-3 flex gap-3">
        <button
            type="button"
            class ="px-3 py-3 flex-1"
        > {{ t('admin.settings.day') }}
        </button>

        <button
            type="button"
            class ="px-3 py-3 flex-1"
        > {{ t('admin.settings.night') }}
        </button>
      </div>
    </div>

    <!-- Notificaciones -->
    <div class="px-7">
      <p class="text-xl font-semibold text-black"> {{ t('admin.settings.notifications') }} </p>

      <div class="px-4">
        <label class="flex items-center p-2 gap-3">
          <pv-checkbox
              v-model="notifications.sms"
              binary
          />
          <span>{{ t('admin.settings.notify.sms') }}</span>
        </label>

        <label class="flex items-center p-2 gap-3">
          <pv-checkbox
              v-model="notifications.email"
              binary
          />
          <span>{{ t('admin.settings.notify.email') }}</span>
        </label>

        <label class="flex items-center p-2 gap-3">
          <pv-checkbox
              v-model="notifications.calls"
              binary
          />
          <span>{{ t('admin.settings.notify.calls') }}</span>
        </label>

        <label class="flex items-center p-2 gap-3">
          <pv-checkbox
              v-model="notifications.social"
              binary
          />
          <span>{{ t('admin.settings.notify.social') }}</span>
        </label>
      </div>
    </div>


    <!-- Tipo de Alarma -->
    <div class="px-7">
      <p class="text-xl font-semibold text-black"> {{ t('admin.settings.alarmType') }} </p>

      <div class="p-3 flex gap-3">
        <pv-dropdown
            v-model="alarm"
            :options="alarmOptions"
            option-label="label"
            option-value="value"
            class ="py-1 flex-1"
            :placeholder="t('admin.settings.select')"
        />
      </div>
    </div>

  </section>
</template>
