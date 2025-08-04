<template>
  <q-page padding>
    <q-table :rows="exams" :columns="columns" row-key="id" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchExams } from 'src/usecases/exams';
import type { Exam } from 'src/domain/exam';

const exams = ref<Exam[]>([]);
const columns = [
  { name: 'title', label: 'Título', field: 'title' },
  { 
    name: 'quizzesCount', 
    label: 'Quizzes', 
    field: (row: Exam) => row.quizzes?.length || 0 
  },
];

onMounted(async () => {
  try {
    const data = await fetchExams();
    exams.value = data.exams; // Now backend returns { exams: [], total, page, totalPages }
  } catch (err) {
    console.error('Error fetching exams:', err);
  }
});
</script>
