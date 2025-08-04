<template>
  <q-page padding>
    <q-uploader @added="onAdded" :auto-upload="false" accept=".pdf,.doc,.docx" />
    <q-form @submit.prevent="onSubmit" class="q-gutter-md q-mt-md">
      <q-input v-model.number="numQuestions" type="number" label="Quantidade de questões" />
      <q-input v-model="quizTitle" label="Título do Quiz" />
      <q-input v-model="examTitle" label="Título da Prova" />
      <q-input v-model="lingua" label="Língua" />
      <q-btn label="Enviar" type="submit" color="primary" />
    </q-form>
    <pre class="q-mt-md">{{ result }}</pre>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { uploadFile } from 'src/usecases/upload';

const file = ref<File | null>(null);
const numQuestions = ref(5);
const quizTitle = ref('');
const examTitle = ref('');
const lingua = ref('pt-br');
const result = ref('');

function onAdded(files: readonly File[]) {
  file.value = files[0] ?? null;
}

async function onSubmit() {
  try {
    if (!file.value) return;
    const form = new FormData();
    form.append('file', file.value);
    form.append('numQuestions', String(numQuestions.value));
    form.append('quizTitle', quizTitle.value);
    form.append('examTitle', examTitle.value);
    form.append('lingua', lingua.value);
    const data = await uploadFile(form);
    result.value = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
  }
}
</script>
