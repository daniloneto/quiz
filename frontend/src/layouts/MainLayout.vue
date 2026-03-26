<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Quiz App</q-toolbar-title>
        <div class="row items-center q-gutter-sm">
          <q-btn v-if="!isAuthenticated" flat to="/login" label="Entrar" />
          <q-btn v-else flat @click="doLogout" icon="logout" label="Sair" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/exams">
          <q-item-section avatar><q-icon name="assignment" /></q-item-section>
          <q-item-section>Provas</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-ripple to="/results">
          <q-item-section avatar><q-icon name="insights" /></q-item-section>
          <q-item-section>Resultados</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/profile">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Perfil</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-ripple to="/upload">
          <q-item-section avatar><q-icon name="upload_file" /></q-item-section>
          <q-item-section>Upload (IA)</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/crawler">
          <q-item-section avatar><q-icon name="language" /></q-item-section>
          <q-item-section>Crawler (IA)</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/backup">
          <q-item-section avatar><q-icon name="save" /></q-item-section>
          <q-item-section>Backup</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const leftDrawerOpen = ref(true)
const auth = useAuthStore()
const isAuthenticated = computed(() => auth.isAuthenticated)
const doLogout = () => auth.logout()
</script>

<style scoped>
</style>

