<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="q-pa-lg" style="min-width:300px">
      <q-card-section>
        <div class="text-h6">Redefinir senha</div>
      </q-card-section>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input v-model="password" label="Nova senha" type="password" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Salvar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from 'src/usecases/auth';

const password = ref('');
const route = useRoute();
const router = useRouter();

async function onSubmit() {
  try {
    const token = route.query.token as string;
    await resetPassword(token, password.value);
    password.value = '';
    void router.push('/login');
  } catch (err) {
    console.error(err);
  }
}
</script>
