<template>
  <q-page class="row justify-center items-center q-pa-md" style="min-height: 70vh">
    <q-card style="width: 420px; max-width: 90vw">
      <q-card-section class="text-h6">Entrar</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="username" label="Usuário" dense outlined required />
          <q-input v-model="password" label="Senha" :type="isPwd ? 'password' : 'text'" dense outlined required>
            <template #append>
              <q-icon :name="isPwd ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <q-select v-model="loginType" :options="loginTypes" label="Tipo de Login" dense outlined emit-value map-options />
          <div class="row items-center justify-between">
            <q-btn type="submit" color="primary" label="Entrar" :loading="loading" />
            <div class="text-caption">
              <router-link to="/forgot">Esqueci minha senha</router-link>
            </div>
          </div>
          <div class="text-caption">Não tem conta? <router-link to="/register">Registre-se</router-link></div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Notify } from 'quasar'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loginType = ref('user')
const loginTypes = [
  { label: 'Usuário', value: 'user' },
  { label: 'Admin', value: 'admin' },
]
const isPwd = ref(true)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    await auth.login({ username: username.value, password: password.value, loginType: loginType.value })
    Notify.create({ type: 'positive', message: 'Login realizado!' })
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao entrar' })
  } finally {
    loading.value = false
  }
}
</script>
