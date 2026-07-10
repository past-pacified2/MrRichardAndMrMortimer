<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 8,
  },
);
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    aria-busy="true"
    aria-label="Loading characters"
  >
    <div v-for="index in count" :key="index" class="animate-pulse rounded-lg border border-white/10 p-4">
      <div class="mx-auto mb-4 aspect-square w-full max-w-40 rounded-full bg-white/10" />
      <div class="mb-2 h-5 w-3/4 rounded bg-white/10" />
      <div class="mb-2 h-4 w-1/2 rounded bg-white/10" />
      <div class="h-4 w-2/3 rounded bg-white/10" />
    </div>
  </div>
</template>
