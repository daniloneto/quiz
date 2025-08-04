<template>
  <q-page padding>
    <q-btn label="Gerar Backup" color="primary" @click="onBackup" />
  </q-page>
</template>

<script setup lang="ts">
import { createBackup } from 'src/usecases/backup';

async function onBackup() {
  try {
    const blob = await createBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
}
</script>
