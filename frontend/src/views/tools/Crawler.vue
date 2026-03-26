<template>
  <q-page class="q-pa-md">
    <q-card class="q-mx-auto" style="max-width: 900px">
      <q-card-section class="text-h6">Crawler de URLs (IA)</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-select v-model="examTitle" :options="examOptions" label="Prova" outlined dense use-input @filter="filterExams" :loading="loadingExams" emit-value map-options />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="quizTitle" label="Título do Quiz" outlined dense />
            </div>
            <div class="col-6 col-sm-2">
              <q-input v-model.number="numQuestions" label="Questões/chunk" type="number" outlined dense />
            </div>
            <div class="col-6 col-sm-2">
              <q-select v-model="lingua" :options="linguas" label="Língua" outlined dense />
            </div>
            <div class="col-12">
              <q-input v-model="urlsText" type="textarea" rows="8" outlined label="URLs (1 por linha)" />
            </div>
          </div>
          <div class="row justify-end">
            <q-btn type="submit" color="primary" label="Processar" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { Notify } from 'quasar'

const examTitle = ref('')
const quizTitle = ref('')
const numQuestions = ref(5)
const lingua = ref('pt-BR')
const linguas = ['pt-BR','en-US','es-ES']
const urlsText = ref('')
const loading = ref(false)

const loadingExams = ref(false)
const examOptions = ref<any[]>([])
const fetchExams = async () => {
  loadingExams.value = true
  try {
    const { data } = await api.get('/exams', { params: { page: 1, limit: 1000 } })
    examOptions.value = data.exams.map((e: any) => ({ label: e.title, value: e.title }))
  } finally {
    loadingExams.value = false
  }
}
const filterExams = (val: string, update: any) => {
  update(() => {
    const needle = (val || '').toLowerCase()
    examOptions.value = examOptions.value.filter((o: any) => o.label.toLowerCase().includes(needle))
  })
}
onMounted(fetchExams)

const onSubmit = async () => {
  const urls = urlsText.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  if (!urls.length) return Notify.create({ type: 'negative', message: 'Informe ao menos 1 URL' })
  loading.value = true
  try {
    await api.post('/crawler', { urls, numQuestions: numQuestions.value, quizTitle: quizTitle.value, examTitle: examTitle.value, lingua: lingua.value })
    Notify.create({ type: 'positive', message: 'Perguntas geradas e adicionadas!' })
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha no crawler' })
  } finally {
    loading.value = false
  }
}
</script>

