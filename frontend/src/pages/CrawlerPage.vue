<template>
  <q-page padding>
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model="urls" label="URLs (separadas por vírgula)" />
      <q-input v-model.number="numQuestions" type="number" label="Quantidade de questões" />
      <q-input v-model="quizTitle" label="Título do Quiz" />
      <q-input v-model="examTitle" label="Título da Prova" />
      <q-input v-model="lingua" label="Língua" />
      <q-btn label="Gerar" type="submit" color="primary" />
    </q-form>
    <pre class="q-mt-md">{{ result }}</pre>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { runCrawler } from 'src/usecases/crawler';

const urls = ref('');
const numQuestions = ref(5);
const quizTitle = ref('');
const examTitle = ref('');
const lingua = ref('pt-br');
const result = ref('');

async function onSubmit() {
  try {
    const data = await runCrawler({
      urls: urls.value.split(',').map((u) => u.trim()),
      numQuestions: numQuestions.value,
      quizTitle: quizTitle.value,
      examTitle: examTitle.value,
      lingua: lingua.value,
    });
    result.value = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
  }
}
</script>
