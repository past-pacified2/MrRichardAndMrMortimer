<script setup lang="ts">
import { RouterView } from 'vue-router';

import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
</script>

<template>
  <Header />

  <main class="container block py-4">
    <RouterView />
  </main>

  <Footer class="mt-auto" />
</template>

<style scoped>
footer {
  margin-top: auto;
}
</style>
