<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Quiz Portal</q-toolbar-title>
        <q-btn v-if="auth.token" flat icon="logout" @click="logout" />
        <q-btn v-else flat label="Login" to="/login" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';

const auth = useAuthStore();

function logout() {
  auth.logout();
}
</script>
