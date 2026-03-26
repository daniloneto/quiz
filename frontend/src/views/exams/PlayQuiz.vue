<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Provas" to="/exams" icon="assignment" />
      <q-breadcrumbs-el :label="examTitle || '...'" :to="`/exams/${id}`" icon="description" />
      <q-breadcrumbs-el :label="`Quiz #${index}`" icon="sports_esports" />
    </q-breadcrumbs>

    <div v-if="loading" class="q-pa-md">Carregando quiz...</div>
    <div v-else-if="!quiz">Quiz não encontrado.</div>
    <div v-else>
      <q-card class="q-mb-md">
        <q-card-section class="text-h6">{{ quiz.title }}</q-card-section>
        <q-separator />
        <q-card-section>
          <div v-for="(q, qIdx) in quiz.questions" :key="qIdx" class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">{{ qIdx + 1 }}. {{ q.question }}</div>
            <q-option-group
              v-model="answers[qIdx]"
              :options="q.options.map((o, i) => ({ label: `${String.fromCharCode(65+i)}. ${o.text}`, value: i }))"
              type="radio"
            />
          </div>
          <div class="row justify-end">
            <q-btn color="primary" label="Enviar" @click="submit" />
          </div>
        </q-card-section>
      </q-card>
      <q-banner v-if="resultMsg" :class="resultOk ? 'bg-positive text-white' : 'bg-negative text-white'">{{ resultMsg }}</q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'
import type { Quiz } from '../../types'
import { useAuthStore } from '../../stores/auth'
import { Notify } from 'quasar'

const route = useRoute()
const id = route.params.id as string
const index = Number(route.params.index)
const examTitle = (route.query.title as string) || ''
const quiz = ref<Quiz | null>(null)
const loading = ref(false)
const answers = ref<number[]>([])
const resultMsg = ref('')
const resultOk = ref(false)
const auth = useAuthStore()

const fetchQuiz = async () => {
  if (!examTitle) return
  loading.value = true
  try {
    const { data } = await api.get(`/exams/${encodeURIComponent(examTitle)}/quiz/${index}`)
    quiz.value = data
    answers.value = new Array(data.questions?.length || 0).fill(-1)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!quiz.value) return
  let correct = 0
  quiz.value.questions.forEach((q, i) => {
    const selected = answers.value[i]
    if (selected >= 0 && q.options[selected]?.correct) correct++
  })
  const total = quiz.value.questions.length
  resultOk.value = true
  resultMsg.value = `Você acertou ${correct} de ${total}.` 
  try {
    if (auth.userId) {
      await api.post('/quiz/save-quiz-result', { userId: auth.userId, examId: id, quizIndex: index, correctAnswers: correct, totalQuestions: total })
      // Pontos: simples, 1 ponto por acerto
      await api.post('/profile/atualizar-pontos', { userId: auth.userId, pontos: correct })
    }
    Notify.create({ type: 'positive', message: 'Resultado salvo!' })
  } catch (err) {
    Notify.create({ type: 'warning', message: 'Jogado, porém falhou salvar resultado.' })
  }
}

onMounted(fetchQuiz)
</script>

