<script setup lang="ts">
import type { Character, CharacterStatus } from '@/types/api';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onScopeDispose, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { CHARACTER_PREFETCH_HOVER_MS, prefetchCharacter } from '@/composables/useCharacter';
import LazyImage from './LazyImage.vue';

const props = defineProps<{
  character: Character;
}>();

const queryClient = useQueryClient();
const prefetchTimer = ref<ReturnType<typeof setTimeout> | undefined>();

const statusClasses: Record<CharacterStatus, string> = {
  Alive: 'bg-green-500/15 text-green-700 dark:text-green-400',
  Dead: 'bg-red-500/15 text-red-700 dark:text-red-400',
  unknown: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
};

const statusClass = computed(() => statusClasses[props.character.status]);

function clearPrefetchTimer() {
  if (prefetchTimer.value) {
    clearTimeout(prefetchTimer.value);
    prefetchTimer.value = undefined;
  }
}

function onMouseEnter() {
  clearPrefetchTimer();

  prefetchTimer.value = setTimeout(() => {
    void prefetchCharacter(queryClient, props.character.id);
    prefetchTimer.value = undefined;
  }, CHARACTER_PREFETCH_HOVER_MS);
}

function onMouseLeave() {
  clearPrefetchTimer();
}

onScopeDispose(() => {
  clearPrefetchTimer();
});
</script>

<template>
  <RouterLink
    :to="{ name: 'character', params: { id: character.id } }"
    class="character-card block rounded-lg border border-white/10 p-4 transition hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    :aria-label="`View ${character.name}'s details`"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <LazyImage :src="character.image" :alt="character.name" :width="300" :height="300" />
    <h2 class="character-card__name mb-2 text-xl text-white">
      {{ character.name }}
    </h2>
    <p class="character-card__meta mb-1">
      <span class="character-card__status inline-block rounded-full px-2 py-0.5 text-sm" :class="statusClass">
        {{ character.status }}
      </span>
    </p>
    <p class="character-card__species text-sm text-white">
      {{ character.species }}
    </p>
  </RouterLink>
</template>
