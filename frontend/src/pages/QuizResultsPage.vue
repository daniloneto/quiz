<template>
  <q-page padding>
    <q-list>
      <q-item v-for="(res, idx) in results" :key="idx">
        <q-item-section>{{ res }}</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchQuizResults } from 'src/usecases/quizzes';
import { useAuthStore } from 'src/stores/auth';

const results = ref<unknown[]>([]);
const auth = useAuthStore();

onMounted(async () => {
  try {
    const data = await fetchQuizResults(auth.user?.id || '');
    results.value = (Array.isArray(data) ? data : []) as unknown[];
  } catch (err) {
    console.error(err);
  }
});
</script>
