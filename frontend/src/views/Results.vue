<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="text-h6">Meus Resultados</q-card-section>
      <q-separator />
      <q-card-section>
        <q-table :rows="rows" :columns="columns" row-key="key" flat bordered :loading="loading">
          <template #body-cell-answers="props">
            <q-td :props="props">
              <div v-for="a in props.row.answers" :key="a.date">
                {{ new Date(a.date).toLocaleString() }} — {{ a.correctAnswers }}/{{ a.totalQuestions }}
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const rows = ref<any[]>([])
const columns = [
  { name: 'examTitle', label: 'Prova', field: 'examTitle', align: 'left' as const },
  { name: 'quizIndex', label: 'Quiz', field: 'quizIndex', align: 'left' as const },
  { name: 'answers', label: 'Tentativas', field: 'answers', align: 'left' as const },
] as any[]

onMounted(async () => {
  if (!auth.userId) return
  loading.value = true
  try {
    const { data } = await api.get(`/quiz/quiz-results/${auth.userId}`)
    // Flatten rows
    const out: any[] = []
    for (const r of data) {
      const quizzes = r.quizzes || {}
      Object.values(quizzes as any).forEach((q: any) => {
        out.push({ examTitle: r.examTitle, quizIndex: q.quizIndex, answers: q.answers || [] })
      })
    }
    rows.value = out
  } finally {
    loading.value = false
  }
})
</script>
