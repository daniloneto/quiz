<template>
  <q-page class="row justify-center items-center q-pa-md" style="min-height: 70vh">
    <q-card style="width: 520px; max-width: 95vw">
      <q-card-section class="text-h6">Registro</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input v-model="username" label="Usuário" dense outlined required />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="email" type="email" label="E-mail" dense outlined required />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="nome" label="Nome" dense outlined required />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="password" label="Senha" :type="isPwd ? 'password' : 'text'" dense outlined required>
                <template #append>
                  <q-icon :name="isPwd ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="isPwd = !isPwd" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row items-center justify-end">
            <q-btn type="submit" color="primary" label="Criar conta" :loading="loading" />
          </div>
          <div class="text-caption">Já tem conta? <router-link to="/login">Entrar</router-link></div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../../services/api'
import { Notify } from 'quasar'

const username = ref('')
const email = ref('')
const nome = ref('')
const password = ref('')
const isPwd = ref(true)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    await api.post('/auth/register', { username: username.value, email: email.value, nome: nome.value, password: password.value })
    Notify.create({ type: 'positive', message: 'Registrado! Verifique seu e-mail para ativação.' })
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha no registro' })
  } finally {
    loading.value = false
  }
}
</script>

