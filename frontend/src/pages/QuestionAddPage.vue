<template>
  <q-page padding>
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model="statement" label="Enunciado" />
      <div v-for="(opt, idx) in options" :key="idx" class="row items-center q-gutter-sm">
        <q-input v-model="options[idx]" :label="`Opção ${idx + 1}`" class="col" />
        <q-radio v-model="correctOption" :val="idx" />
      </div>
      <q-btn type="submit" label="Salvar" color="primary" />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { addQuestion } from 'src/usecases/quizzes';

const route = useRoute();
const statement = ref('');
const options = ref(['', '', '', '']);
const correctOption = ref(0);

async function onSubmit() {
  try {
    await addQuestion({
      examId: route.params.examId as string,
      quizIndex: Number(route.params.quizIndex),
      statement: statement.value,
      options: options.value,
      correctOption: correctOption.value,
    });
    statement.value = '';
    options.value = ['', '', '', ''];
  } catch (err) {
    console.error(err);
  }
}
</script>
