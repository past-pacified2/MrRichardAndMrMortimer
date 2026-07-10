<script setup lang="ts">
import CharactersGrid from '@/components/CharactersGrid/index.vue';
import { defaultPageSeo } from '@/seo/site';
import { usePageSeo } from '@/seo/usePageSeo';

defineOptions({
  name: 'HomeView',
});

usePageSeo(defaultPageSeo);
</script>

<template>
  <section aria-labelledby="characters-heading">
    <header class="mb-6">
      <h1 id="characters-heading" class="text-white">Characters</h1>
      <p class="text-white/70">Browse characters from the Rick and Morty universe.</p>
    </header>

    <CharactersGrid />
  </section>
</template>
