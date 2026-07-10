<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

defineProps<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}>();

const root = useTemplateRef('root');
const shouldLoad = ref(false);

useIntersectionObserver(
  root,
  ([entry]) => {
    if (entry?.isIntersecting) {
      shouldLoad.value = true;
    }
  },
  {
    rootMargin: '50px',
  },
);
</script>

<template>
  <div ref="root" class="character-card__image-wrapper relative mx-auto mb-4 aspect-square w-full max-w-40">
    <div v-if="!shouldLoad" class="absolute inset-0 rounded-full bg-white/10" aria-hidden="true" />
    <img
      v-if="shouldLoad"
      :src="src"
      :alt="alt"
      :width="width ?? 300"
      :height="height ?? 300"
      decoding="async"
      fetchpriority="low"
      class="character-card__image aspect-square w-full rounded-full object-cover"
    />
  </div>
</template>
