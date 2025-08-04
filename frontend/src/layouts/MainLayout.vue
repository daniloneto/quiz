<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>Quiz Portal</q-toolbar-title>
        <q-btn v-if="auth.token" flat icon="logout" @click="logout" />
        <q-btn v-else flat label="Login" to="/login" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above>
      <q-list>
        <q-item to="/exams" clickable v-ripple>
          <q-item-section>Provas</q-item-section>
        </q-item>
        <q-item to="/profile" clickable v-ripple>
          <q-item-section>Perfil</q-item-section>
        </q-item>
        <q-item to="/crawler" clickable v-ripple>
          <q-item-section>Crawler</q-item-section>
        </q-item>
        <q-item to="/upload" clickable v-ripple>
          <q-item-section>Upload</q-item-section>
        </q-item>
        <q-item to="/backup" clickable v-ripple>
          <q-item-section>Backup</q-item-section>
        </q-item>
        <q-item to="/quiz-results" clickable v-ripple>
          <q-item-section>Resultados</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';

const auth = useAuthStore();
const drawer = ref(false);

function logout() {
  auth.logout();
}
</script>
