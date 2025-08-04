<template>
  <q-page class="row items-center justify-evenly">
    <div>{{ message }}</div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { confirmEmail } from 'src/usecases/auth';

const route = useRoute();
const message = ref('Confirmando...');

onMounted(async () => {
  try {
    const token = route.query.token as string;
    await confirmEmail(token);
    message.value = 'Email confirmado!';
  } catch (err) {
    message.value = 'Falha ao confirmar email';
    console.error(err);
  }
});
</script>
