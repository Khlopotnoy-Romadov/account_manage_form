<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <MainForm />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import MainForm from './components/MainForm.vue'
</script>

<style>
.v-application {
  background-color: #f8f9fa;
}

.v-container {
  max-width: none;
  padding: 20px;
}
</style>