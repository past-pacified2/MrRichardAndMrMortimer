<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { nextTick, ref, useTemplateRef, watch } from 'vue';

const props = defineProps<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}>();

const root = useTemplateRef('root');
const imageRef = useTemplateRef('image');
const shouldLoad = ref(false);
const isLoaded = ref(false);

watch(
  () => props.src,
  () => {
    isLoaded.value = false;
  },
);

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

async function syncLoadedState() {
  await nextTick();

  const image = imageRef.value;

  if (image?.complete && image.naturalWidth > 0) {
    isLoaded.value = true;
  }
}

watch(shouldLoad, (load) => {
  if (load) {
    void syncLoadedState();
  }
});

function onLoad() {
  isLoaded.value = true;
}

function onError() {
  isLoaded.value = true;
}
</script>

<template>
  <div ref="root" class="character-card__image-wrapper relative mx-auto mb-4 aspect-square w-full max-w-40">
    <div
      v-if="!isLoaded"
      class="character-card__image-placeholder absolute inset-0 animate-pulse rounded-full bg-white/10"
      aria-hidden="true"
    />
    <img
      v-if="shouldLoad"
      ref="image"
      :src="src"
      :alt="alt"
      :width="width ?? 300"
      :height="height ?? 300"
      decoding="async"
      fetchpriority="low"
      class="character-card__image aspect-square w-full rounded-full object-cover transition-opacity duration-200"
      :class="{ 'opacity-0': !isLoaded }"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>
