<script setup>

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const user = ref({
  name: 'Juan Pablo',
  lastName: 'Contreras Garcia',
  user: 'juanupc',
  email: 'juanupc@gmail.com',
  plan: 'Plan Pro',
  registrationDate: '09-18-2025',
  lastConnection: '11-11-2025',
  password: 'juan2025'
})

const saveProfile = () => {
  console.log('Saved profile', user.value)
  alert(t('admin.alert.save'))
}

const cancelChanges = () => {
  alert(t('admin.alert.cancel'))
}

const showPassword = ref(false)

</script>

<template>
  <section>
    <div class="px-7 py-3 flex items-center">
        <h1 class="text-10 font-semibold flex-1">{{ t('admin.users.title') }}</h1>

        <div class="flex gap-2">
          <RouterLink :to="{ name: 'admin-settings' }">
            <pv-button :label="t('admin.settings.title')" />
          </RouterLink>
        </div>
    </div>
  </section>

  <section>
    <div class="grid gap-6">
      <!-- Información de Usuario -->
      <div class="md:col-span-2 bg-[#123e31] px-8 rounded-2xl shadow-md grid gap-5">
        <!-- Nombres -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.firstName') }} </p>
          <pv-input-text
              v-model="user.name"
          />
        </div>

        <!-- Apellidos -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.lastName') }} </p>
          <pv-input-text
              v-model="user.lastName"
          />
        </div>

        <!-- Usuario -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.user') }} </p>
          <pv-input-text
              v-model="user.user"
          />
        </div>
      </div>
    </div>

    <div class="py-7 grid gap-6">
      <!-- Información de Registro -->
      <div class="md:col-span-2 bg-[#123e31] px-8 rounded-2xl shadow-md grid gap-5">
        <!-- Correo -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.email') }} </p>
          <pv-input-text
              v-model="user.email"
              disabled/>
        </div>

        <!-- Fecha de inscripción -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.registerDate') }} </p>
          <pv-input-text
              v-model="user.registrationDate"
              disabled
          />
        </div>

        <!-- Última conexión -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.lastConnection') }} </p>
          <pv-input-text
              v-model="user.lastConnection"
              disabled
              class="w-[9000px]"
          />
        </div>

        <!-- Contraseña -->
        <div>
          <p class="text-xl font-semibold text-black"> {{ t('admin.users.password') }} </p>
          <div class="flex items-center gap-3">
            <pv-input-text
                v-model="user.password"
                :type="showPassword ? 'text' : 'password'"
            />
            <pv-button
                :label="showPassword ? t('admin.users.hide') : t('admin.users.show')"
                severity="secondary"
                size="small"
                @click="showPassword = !showPassword"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- Planes -->
    <div class="px-7">
      <p class="text-xl font-semibold text-black"> {{ t('admin.users.plans') }} </p>
      <pv-input-text
          v-model="user.plan"
          disabled
          class="w-[9000px]"
      />
    </div>
  </section>

  <section>
    <!-- Botones -->
    <div class="p-7">
      <div class="flex justify-end gap-3">
        <pv-button
            :label="t('admin.settings.cancel')"
            severity="secondary"
            @click="cancelChanges"
        />
        <pv-button
            :label="t('admin.settings.save')"
            severity="success"
            @click="saveProfile"
        />
      </div>
    </div>
  </section>
</template>

<style>
.p-inputtext {
  width: 300px;
}
</style>
