<template>
  <q-card flat bordered>
    <q-card-section class="text-subtitle1">Adicionar Pergunta</q-card-section>
    <q-separator />
    <q-card-section>
      <q-form @submit="submit" class="q-gutter-md">
        <q-input v-model="question" label="Enunciado" outlined dense required />
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6" v-for="idx in 4" :key="idx">
            <q-input v-model="options[idx-1]" :label="`Opção ${String.fromCharCode(64+idx)}`" outlined dense required />
          </div>
        </div>
        <q-select v-model="correct" :options="[0,1,2,3]" :option-label="i => `Correta: ${String.fromCharCode(65 + i)}`" :option-value="i => i" label="Resposta correta" outlined dense />
        <div class="row justify-end">
          <q-btn type="submit" color="primary" label="Adicionar" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ (e: 'add', payload: { question: string; options: string[]; correct: number }): void }>()
const question = ref('')
const options = ref<string[]>(['', '', '', ''])
const correct = ref<number>(0)

const submit = () => {
  emit('add', { question: question.value, options: options.value, correct: correct.value })
  question.value = ''
  options.value = ['', '', '', '']
  correct.value = 0
}
</script>
