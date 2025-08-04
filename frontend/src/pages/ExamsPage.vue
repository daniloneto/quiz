<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <q-form @submit.prevent="onCreate" class="row q-gutter-sm items-center">
        <q-input v-model="newExam.title" label="Título" />
        <q-input v-model="newExam.description" label="Descrição" />
        <q-btn label="Adicionar" type="submit" color="primary" />
      </q-form>
      <q-btn label="Backup" color="secondary" @click="onBackup" />
    </div>
    <q-table :rows="exams" :columns="columns" row-key="id">
      <template #body-cell-title="props">
        <q-td :props="props">
          <router-link :to="`/exams/${props.row.id}?title=${props.row.title}`">{{ props.row.title }}</router-link>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="delete" color="negative" @click="remove(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchExams, createExam, deleteExam } from 'src/usecases/exams';
import { createBackup } from 'src/usecases/backup';
import type { Exam } from 'src/domain/exam';

const exams = ref<Exam[]>([]);
const columns = [
  { name: 'title', label: 'Título', field: 'title' },
  { name: 'quizzesCount', label: 'Quizzes', field: 'quizzesCount' },
  { name: 'actions', label: 'Ações', field: 'actions' },
];

const newExam = ref({ title: '', description: '' });

async function load() {
  const data = await fetchExams();
  exams.value = data.items;
}

onMounted(async () => {
  try {
    await load();
  } catch (err) {
    console.error(err);
  }
});

async function onCreate() {
  try {
    await createExam(newExam.value);
    newExam.value = { title: '', description: '' };
    await load();
  } catch (err) {
    console.error(err);
  }
}

async function remove(id: string) {
  try {
    await deleteExam(id);
    await load();
  } catch (err) {
    console.error(err);
  }
}

async function onBackup() {
  try {
    const blob = await createBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
}
</script>
