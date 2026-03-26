<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section class="text-h6">Bem-vindo(a)</q-card-section>
          <q-separator />
          <q-card-section>
            <div v-if="profile">Olá, {{ profile.nome }}! Seu nível: {{ profile.nivel }} ({{ profile.pontos }} pts)</div>
            <div v-else>Carregando perfil...</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-subtitle1">Ações rápidas</q-card-section>
          <q-separator />
          <q-list>
            <q-item clickable to="/exams">
              <q-item-section avatar><q-icon name="assignment" /></q-item-section>
              <q-item-section>Ver Provas</q-item-section>
            </q-item>
            <q-item clickable to="/results">
              <q-item-section avatar><q-icon name="insights" /></q-item-section>
              <q-item-section>Resultados</q-item-section>
            </q-item>
            <q-item clickable to="/upload">
              <q-item-section avatar><q-icon name="upload_file" /></q-item-section>
              <q-item-section>Upload (IA)</q-item-section>
            </q-item>
          </q-list>
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

onMounted(async () => {
  try {
    if (auth.userId) {
      const { data } = await api.get(`/profile/id/${auth.userId}`)
      profile.value = data
    }
  } catch (err: any) {
    console.error(err)
  }
})
</script>

