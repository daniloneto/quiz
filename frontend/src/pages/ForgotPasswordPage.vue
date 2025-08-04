<template>
  <q-page class="row items-center justify-evenly">
    <q-card class="q-pa-lg" style="min-width:300px">
      <q-card-section>
        <div class="text-h6">Esqueci a senha</div>
      </q-card-section>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input v-model="email" label="E-mail" type="email" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Enviar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { forgotPassword } from 'src/usecases/auth';

const email = ref('');

async function onSubmit() {
  try {
    await forgotPassword(email.value);
    email.value = '';
  } catch (err) {
    console.error(err);
  }
}
</script>
