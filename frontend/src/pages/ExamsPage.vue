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
  { name: 'quizzesCount', label: 'Quizzes', field: 'quizzesCount' },
];

onMounted(async () => {
  try {
    const data = await fetchExams();
    exams.value = data.items;
  } catch (err) {
    console.error(err);
  }
});
</script>
