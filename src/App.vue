<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <header>
    <h1>Rick & Morty</h1>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>
    <div>© {{ new Date().getFullYear() }} Rick & Morty API SPA</div>
  </footer>
</template>

<style scoped>
footer {
  margin-top: auto;
}
</style>
