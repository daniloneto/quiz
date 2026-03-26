<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card>
          <q-card-section class="text-h6">Perfil</q-card-section>
          <q-separator />
          <q-card-section v-if="profile">
            <div class="q-mb-sm"><b>Nome:</b> {{ profile.nome }}</div>
            <div class="q-mb-sm"><b>Email:</b> {{ profile.email }}</div>
            <div class="q-mb-sm"><b>Pontos:</b> {{ profile.pontos }}</div>
            <div class="q-mb-sm"><b>Nível:</b> {{ profile.nivel }}</div>
            <div class="q-mb-sm"><b>Criado em:</b> {{ new Date(profile.data_criacao).toLocaleString() }}</div>
          </q-card-section>
          <q-card-section v-else>Carregando...</q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-7">
        <q-card>
          <q-card-section class="text-h6">Níveis</q-card-section>
          <q-separator />
          <q-card-section>
            <q-table :rows="levels" :columns="columns" row-key="nivel" flat bordered />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const profile = ref<any>(null)
const levels = ref<any[]>([])
const columns = [
  { name: 'nivel', label: 'Nível', field: 'nivel', align: 'left' as const },
  { name: 'pontos', label: 'Pontos Mínimos', field: 'pontos', align: 'left' as const },
  { name: 'limiteSuperior', label: 'Pontos Máximos', field: 'limiteSuperior', align: 'left' as const },
] as any[]

onMounted(async () => {
  if (!auth.userId) return
  const [{ data: p }, { data: l }] = await Promise.all([
    api.get(`/profile/id/${auth.userId}`),
    api.get('/profile/levels')
  ])
  profile.value = p
  levels.value = l
})
</script>
