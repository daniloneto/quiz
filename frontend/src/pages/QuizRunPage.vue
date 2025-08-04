<template>
  <q-page padding v-if="quiz">
    <div class="text-h5 q-mb-md">{{ quiz.title }}</div>
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <div v-for="(q, qIdx) in quiz.questions" :key="qIdx" class="q-mb-md">
        <div class="text-subtitle1">{{ q.statement }}</div>
        <q-option-group v-model="answers[qIdx]" :options="q.options.map((opt, idx) => ({ label: opt, value: idx }))" type="radio" />
      </div>
      <q-btn type="submit" label="Enviar" color="primary" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchExamQuiz } from 'src/usecases/exams';
import { saveQuizResult } from 'src/usecases/quizzes';
import type { Quiz } from 'src/domain/quiz';

const route = useRoute();
const examTitle = route.query.examTitle as string;
const quiz = ref<Quiz | null>(null);
const answers = ref<number[]>([]);

onMounted(async () => {
  const index = Number(route.params.quizIndex);
  const data = await fetchExamQuiz(examTitle, index);
  quiz.value = data;
  answers.value = data.questions.map(() => 0);
});

async function onSubmit() {
  try {
    if (!quiz.value) return;
    await saveQuizResult({ examTitle, quizTitle: quiz.value.title, answers: answers.value });
  } catch (err) {
    console.error(err);
  }
}
</script>
