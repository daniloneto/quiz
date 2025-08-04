<template>
  <q-page padding>
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model="examTitle" label="Prova" />
      <div v-for="(q, idx) in questions" :key="idx" class="q-pa-sm q-mb-md bordered">
        <q-input v-model="q.statement" label="Enunciado" />
        <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="row items-center q-gutter-sm">
          <q-input v-model="q.options[oIdx]" :label="`Opção ${oIdx + 1}`" class="col" />
          <q-radio v-model="q.correctOption" :val="oIdx" />
        </div>
      </div>
      <q-btn label="Adicionar Questão" @click="addQuestion" />
      <q-btn type="submit" label="Salvar" color="primary" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createQuiz } from 'src/usecases/quizzes';

const route = useRoute();
const router = useRouter();
const examId = route.params.examId as string;
const examTitle = ref((route.query.examTitle as string) || '');
interface QuestionForm {
  statement: string;
  options: string[];
  correctOption: number;
}
const questions = ref<QuestionForm[]>([{ statement: '', options: ['', '', '', ''], correctOption: 0 }]);

function addQuestion() {
  questions.value.push({ statement: '', options: ['', '', '', ''], correctOption: 0 });
}

async function onSubmit() {
  try {
    await createQuiz({ examTitle: examTitle.value, questions: questions.value });
    void router.push(`/exams/${examId}?title=${examTitle.value}`);
  } catch (err) {
    console.error(err);
  }
}
</script>
