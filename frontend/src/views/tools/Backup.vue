<template>
  <q-page class="q-pa-md">
    <q-card class="q-mx-auto" style="max-width: 680px">
      <q-card-section class="text-h6">Backup</q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-mb-md">Gera um arquivo de backup no servidor com todas as provas.</div>
        <q-btn color="primary" label="Criar backup" :loading="loading" @click="createBackup" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../../services/api'
import { Notify } from 'quasar'

const loading = ref(false)
const createBackup = async () => {
  loading.value = true
  try {
    await api.post('/backup/create')
    Notify.create({ type: 'positive', message: 'Backup solicitado com sucesso!' })
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao criar backup' })
  } finally {
    loading.value = false
  }
}
</script>

