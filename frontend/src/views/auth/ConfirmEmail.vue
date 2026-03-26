<template>
  <q-page class="q-pa-md">
    <q-card class="q-mx-auto" style="max-width:600px">
      <q-card-section class="text-h6">Confirmação de E-mail</q-card-section>
      <q-separator />
      <q-card-section>
        <div v-if="loading">Validando token...</div>
        <div v-else>
          <q-banner v-if="success" class="bg-positive text-white">{{ message }}</q-banner>
          <q-banner v-else class="bg-negative text-white">{{ message }}</q-banner>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(async () => {
  const token = (route.query.token as string) || ''
  try {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const { data } = await axios.get(`${base}/api/v1/auth/confirm-email`, { params: { token } })
    success.value = true
    message.value = data.message || 'Conta ativada com sucesso.'
  } catch (err: any) {
    success.value = false
    message.value = err?.response?.data?.message || 'Falha na confirmação'
  } finally {
    loading.value = false
  }
})
</script>

