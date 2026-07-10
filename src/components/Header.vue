<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <header class="bg-black/80 px-4 py-2 md:py-5" aria-label="Site header">
    <div class="flex items-center justify-center gap-2">
      <RouterLink :to="{ name: 'home' }" aria-label="Go to home" class="mr-0 block md:mr-auto">
        <img src="/svgs/mortimer.svg" alt="" width="60" height="60" />
      </RouterLink>

      <p class="mr-auto hidden cursor-default text-2xl text-white md:block">Mr. Rick & Mr. Mortimer</p>
    </div>
  </header>
</template>
