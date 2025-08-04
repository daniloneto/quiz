<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">{{ title }}</div>
      <q-btn label="Novo Quiz" color="primary" :to="`/quizzes/${id}/create?examTitle=${title}`" />
    </div>
    <q-table :rows="quizzes" :columns="columns" row-key="index">
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat label="Executar" @click="runQuiz(props.row.index)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchQuizzesByExam } from 'src/usecases/quizzes';
import type { Quiz } from 'src/domain/quiz';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const title = ref(route.query.title as string);
const quizzes = ref<(Quiz & { index: number })[]>([]);
const columns = [
  { name: 'index', label: '#', field: 'index' },
  { name: 'title', label: 'Título', field: 'title' },
  { name: 'actions', label: 'Ações', field: 'actions' },
];

onMounted(async () => {
  try {
    const data = await fetchQuizzesByExam(id);
    quizzes.value = data.map((q: Quiz, idx: number) => ({ ...q, index: idx }));
  } catch (err) {
    console.error(err);
  }
});

function runQuiz(index: number) {
  void router.push(`/quizzes/${id}/${index}?examTitle=${title.value}`);
}
</script>
