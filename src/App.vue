<script setup lang="ts">
import { RouterView } from 'vue-router';

import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
</script>

<template>
  <Header />

  <main class="container px-4 py-4 md:px-6 lg:px-8">
    <RouterView />
  </main>

  <Footer class="mt-auto" />
</template>
