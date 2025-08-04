<template>
  <q-page padding>
    <div v-if="profile">
      <div class="text-h5">{{ profile.name }}</div>
      <div class="q-mt-md">Pontos: {{ profile.points }}</div>
      <div>Nível: {{ profile.level }}</div>
    </div>
    <q-separator class="q-my-md" />
    <div class="text-subtitle1 q-mb-sm">Atualizar Pontos</div>
    <q-form @submit.prevent="onSubmit" class="row items-center q-gutter-sm">
      <q-input v-model.number="points" type="number" label="Pontos" class="col" />
      <q-btn label="Atualizar" type="submit" color="primary" />
    </q-form>
    <q-separator class="q-my-md" />
    <div class="text-subtitle1 q-mb-sm">Níveis</div>
    <q-list>
      <q-item v-for="lvl in levels" :key="lvl.name">
        <q-item-section>{{ lvl.name }}: {{ lvl.minPoints }} - {{ lvl.maxPoints }}</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchProfile, fetchLevels, updatePoints } from 'src/usecases/profile';
import { useAuthStore } from 'src/stores/auth';
import type { Profile, Level } from 'src/domain/profile';

const profile = ref<Profile | null>(null);
const levels = ref<Level[]>([]);
const points = ref(0);
const auth = useAuthStore();

onMounted(async () => {
  try {
    profile.value = await fetchProfile(auth.user?.id || '');
    points.value = profile.value.points || 0;
    levels.value = await fetchLevels();
  } catch (err) {
    console.error(err);
  }
});

async function onSubmit() {
  try {
    await updatePoints(auth.user?.id || '', points.value);
  } catch (err) {
    console.error(err);
  }
}
</script>
