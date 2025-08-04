<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="q-pa-lg" style="min-width:300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input v-model="username" label="Usuário" />
          <q-input v-model="password" label="Senha" type="password" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Entrar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const username = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  try {
    await auth.login(username.value, password.value);
    void router.push('/exams');
  } catch (err) {
    console.error(err);
  }
}
</script>
