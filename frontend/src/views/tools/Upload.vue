<template>
  <q-page class="q-pa-md">
    <q-card class="q-mx-auto" style="max-width: 800px">
      <q-card-section class="text-h6">Upload para gerar perguntas (IA)</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select v-model="examTitle" :options="examOptions" label="Prova" outlined dense use-input @filter="filterExams" :loading="loadingExams" emit-value map-options />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="quizTitle" label="Título do Quiz" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="numQuestions" label="Nº de questões" type="number" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-select v-model="lingua" :options="linguas" label="Língua" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-file v-model="file" label="Arquivo" outlined dense clearable />
            </div>
          </div>
          <div class="row justify-end">
            <q-btn type="submit" color="primary" label="Enviar" :loading="loading" />
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
const file = ref<File | null>(null)
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
  if (!file.value) return Notify.create({ type: 'negative', message: 'Selecione um arquivo' })
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('numQuestions', String(numQuestions.value))
    fd.append('quizTitle', quizTitle.value)
    fd.append('examTitle', examTitle.value)
    fd.append('lingua', lingua.value)
    fd.append('file', file.value)
    await api.post('/upload/gpt-integration', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    Notify.create({ type: 'positive', message: 'Perguntas geradas com sucesso!' })
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha no upload' })
  } finally {
    loading.value = false
  }
}
</script>

