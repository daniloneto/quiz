<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Provas" to="/exams" icon="assignment" />
      <q-breadcrumbs-el :label="examTitle || '...'" icon="description" />
    </q-breadcrumbs>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-h6">Novo Quiz</q-card-section>
          <q-separator />
          <q-card-section>
            <q-form @submit="createQuiz" class="q-gutter-md">
              <q-input v-model="quizTitle" label="Título do Quiz" dense outlined required />
              <div class="row justify-end">
                <q-btn type="submit" color="primary" label="Criar" :loading="creating" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section class="text-h6">Quizzes</q-card-section>
          <q-separator />
          <q-card-section>
            <q-list bordered separator class="rounded-borders">
              <q-item v-for="(q, idx) in quizzes" :key="idx">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">{{ idx }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label overline>Quiz</q-item-label>
                  <q-item-label>{{ q.title || '(sem título)' }}</q-item-label>
                  <q-item-label caption>{{ q.questions?.length || 0 }} perguntas</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat color="primary" size="sm" icon="sports_esports" @click="playQuiz(idx)" />
                  <q-btn flat color="secondary" size="sm" icon="edit" @click="editQuiz(idx)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="editDialog">
      <q-card style="min-width: 700px; max-width: 95vw">
        <q-card-section class="text-h6">Editar Quiz #{{ currentQuizIndex }}</q-card-section>
        <q-separator />
        <q-card-section>
          <div v-if="currentQuestions">
            <div class="q-mb-md">
              <question-editor @add="addQuestion" />
            </div>
            <q-list bordered class="rounded-borders">
              <q-item v-for="(question, qIdx) in currentQuestions" :key="qIdx">
                <q-item-section>
                  <div class="text-subtitle1 q-mb-sm">{{ qIdx+1 }}. {{ question.question }}</div>
                  <div class="column q-gutter-xs">
                    <div v-for="(opt, oIdx) in question.options" :key="oIdx" class="row items-center q-gutter-sm">
                      <q-badge :color="opt.correct ? 'positive' : 'grey-6'">{{ String.fromCharCode(65 + oIdx) }}</q-badge>
                      <q-input v-model="question.options[oIdx].text" dense outlined @blur="updateOption(qIdx, oIdx, question.options[oIdx].text)"/>
                    </div>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat size="sm" color="negative" icon="delete" @click="removeQuestion(qIdx)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import { Notify } from 'quasar'
import QuestionEditor from '../../components/QuestionEditor.vue'
import type { Question } from '../../types'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const quizzes = ref<any[]>([])
const examTitle = ref<string | null>((route.query.title as string) || null)
const creating = ref(false)
const quizTitle = ref('')
const editDialog = ref(false)
const currentQuizIndex = ref<number | null>(null)
const currentQuestions = ref<Question[] | null>(null)

const ensureExamTitle = async () => {
  if (examTitle.value) return
  // fallback: pedir muitas páginas de uma vez para localizar o título
  try {
    const { data } = await api.get('/exams', { params: { page: 1, limit: 1000 } })
    const found = data.exams.find((e: any) => e.id === id)
    examTitle.value = found?.title || null
  } catch {}
}

const fetchQuizzes = async () => {
  const { data } = await api.get(`/quiz/exam/${id}`)
  quizzes.value = data
}

const createQuiz = async () => {
  if (!examTitle.value) {
    await ensureExamTitle()
  }
  if (!examTitle.value) {
    return Notify.create({ type: 'negative', message: 'Não foi possível determinar o título da prova.' })
  }
  creating.value = true
  try {
    await api.post('/quiz', { examTitle: examTitle.value, quiz: { title: quizTitle.value, questions: [] } })
    Notify.create({ type: 'positive', message: 'Quiz criado!' })
    quizTitle.value = ''
    fetchQuizzes()
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao criar quiz' })
  } finally {
    creating.value = false
  }
}

const editQuiz = (idx: number) => {
  currentQuizIndex.value = idx
  currentQuestions.value = (quizzes.value[idx]?.questions || []).map((q: any) => ({...q}))
  editDialog.value = true
}

const addQuestion = async (payload: { question: string; options: string[]; correct: number }) => {
  if (currentQuizIndex.value == null) return
  try {
    await api.post('/question', {
      exam: examTitle.value,
      quiz: quizzes.value[currentQuizIndex.value].title,
      question: payload.question,
      optionA: payload.options[0],
      optionB: payload.options[1],
      optionC: payload.options[2],
      optionD: payload.options[3],
      correctOption: ['A','B','C','D'][payload.correct]
    })
    Notify.create({ type: 'positive', message: 'Pergunta adicionada!' })
    await fetchQuizzes()
    editQuiz(currentQuizIndex.value)
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao adicionar pergunta' })
  }
}

const updateOption = async (questionIndex: number, optionIndex: number, newValue: string) => {
  if (currentQuizIndex.value == null) return
  try {
    await api.put('/question', {
      examId: id,
      quizIndex: currentQuizIndex.value,
      questionIndex,
      optionIndex,
      newValue
    })
    Notify.create({ type: 'positive', message: 'Opção atualizada' })
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao atualizar opção' })
  }
}

const removeQuestion = async (questionIndex: number) => {
  if (currentQuizIndex.value == null) return
  try {
    await api.delete('/question', { data: { examId: id, quizIndex: currentQuizIndex.value, questionIndex } })
    Notify.create({ type: 'positive', message: 'Pergunta removida' })
    await fetchQuizzes()
    editQuiz(currentQuizIndex.value)
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao deletar pergunta' })
  }
}

const playQuiz = (idx: number) => {
  router.push({ path: `/exams/${id}/quiz/${idx}`, query: { title: examTitle.value || '' } })
}

onMounted(async () => {
  await ensureExamTitle()
  await fetchQuizzes()
})
</script>

