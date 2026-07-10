<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  statusCode: string;
  title: string;
  message: string;
}>();
</script>

<template>
  <section class="error-page mx-auto max-w-2xl py-12 text-center" aria-labelledby="error-heading">
    <p class="error-page__code mb-2 text-7xl font-medium text-white/20 md:text-8xl" aria-hidden="true">
      {{ statusCode }}
    </p>

    <h1 id="error-heading" class="error-page__title mb-4 text-white">
      {{ title }}
    </h1>

    <p class="error-page__message mb-8 text-white/70">
      {{ message }}
    </p>

    <RouterLink
      :to="{ name: 'home' }"
      class="error-page__action inline-block rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-white transition hover:border-white/20"
    >
      Back to characters
    </RouterLink>
  </section>
</template>
