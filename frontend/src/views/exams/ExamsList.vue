<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="text-h6">Nova Prova</q-card-section>
          <q-separator />
          <q-card-section>
            <q-form @submit="createExam" class="q-gutter-md">
              <q-input v-model="newExam.title" label="Título" dense outlined required />
              <q-input v-model="newExam.description" label="Descrição" type="textarea" autogrow outlined />
              <div class="row justify-end">
                <q-btn type="submit" color="primary" label="Criar" :loading="creating" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section class="text-h6">Provas</q-card-section>
          <q-separator />
          <q-card-section>
            <q-table
              :rows="exams"
              :columns="columns"
              row-key="id"
              flat bordered
              :pagination="{ rowsPerPage: limit }"
              :loading="loading"
            >
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <q-btn size="sm" color="primary" flat icon="visibility" @click="openExam(props.row)" />
                  <q-btn size="sm" color="negative" flat icon="delete" @click="deleteExam(props.row)" />
                </q-td>
              </template>
            </q-table>
            <div class="row justify-between items-center q-mt-md">
              <q-pagination v-model="page" :max="totalPages" color="primary" @update:model-value="fetchExams" />
              <div class="text-caption">Total: {{ total }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import { Notify } from 'quasar'
import type { Exam } from '../../types'
import { useRouter } from 'vue-router'

const router = useRouter()
const exams = ref<Exam[]>([])
const total = ref(0)
const totalPages = ref(1)
const limit = ref(10)
const page = ref(1)
const loading = ref(false)

const columns = [
  { name: 'title', label: 'Título', field: 'title', align: 'left' as const },
  { name: 'description', label: 'Descrição', field: 'description', align: 'left' as const },
  { name: 'createdAt', label: 'Criado em', field: (r: any) => new Date(r.createdAt).toLocaleString(), align: 'left' as const },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' as const },
] as any[]

const fetchExams = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/exams', { params: { page: page.value, limit: limit.value } })
    exams.value = data.exams
    total.value = data.total
    totalPages.value = data.totalPages
  } finally {
    loading.value = false
  }
}

const newExam = ref({ title: '', description: '' })
const creating = ref(false)
const createExam = async () => {
  creating.value = true
  try {
    await api.post('/exams', newExam.value)
    Notify.create({ type: 'positive', message: 'Prova criada!' })
    newExam.value = { title: '', description: '' }
    fetchExams()
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao criar' })
  } finally {
    creating.value = false
  }
}

const openExam = (row: Exam) => {
  router.push({ path: `/exams/${row.id}`, query: { title: row.title } })
}

const deleteExam = async (row: Exam) => {
  try {
    await api.delete(`/exams/${row.id}`)
    Notify.create({ type: 'positive', message: 'Excluída!' })
    fetchExams()
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao excluir' })
  }
}

onMounted(fetchExams)
</script>
