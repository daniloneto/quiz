<template>
  <q-page class="row justify-center items-center q-pa-md" style="min-height: 70vh">
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="text-h6">Recuperar senha</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="email" type="email" label="E-mail" dense outlined required />
          <div class="row items-center justify-end">
            <q-btn type="submit" color="primary" label="Enviar" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { Notify } from 'quasar'

const email = ref('')
const loading = ref(false)
const router = useRouter()

const onSubmit = async () => {
  loading.value = true
  try {
    await api.post('/auth/forgot-password', { email: email.value })
    Notify.create({ type: 'positive', message: 'Se existir, enviaremos um e-mail com instruções.' })
    // Navega para tela de reset para inserir token e nova senha
    router.push('/reset')
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao solicitar' })
  } finally {
    loading.value = false
  }
}
</script>
