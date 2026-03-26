<template>
  <q-page class="row justify-center items-center q-pa-md" style="min-height: 70vh">
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="text-h6">Redefinir senha</q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input v-model="token" label="Token" dense outlined required />
          <q-input v-model="newPassword" label="Nova senha" :type="isPwd ? 'password' : 'text'" dense outlined required>
            <template #append>
              <q-icon :name="isPwd ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>
          <div class="row items-center justify-end">
            <q-btn type="submit" color="primary" label="Redefinir" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { Notify } from 'quasar'

const route = useRoute()
const router = useRouter()
const token = ref('')
const newPassword = ref('')
const isPwd = ref(true)
const loading = ref(false)

onMounted(() => {
  // Token pode vir por query param
  const t = route.query.token as string
  if (t) token.value = t
})

const onSubmit = async () => {
  loading.value = true
  try {
    // reset-password é público e usa rota absoluta base (sem x-api-key)
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    await axios.post(`${base}/api/v1/auth/reset-password`, { token: token.value, newPassword: newPassword.value })
    Notify.create({ type: 'positive', message: 'Senha redefinida!' })
    router.push('/login')
  } catch (err: any) {
    Notify.create({ type: 'negative', message: err?.response?.data?.message || 'Falha ao redefinir' })
  } finally {
    loading.value = false
  }
}
</script>
