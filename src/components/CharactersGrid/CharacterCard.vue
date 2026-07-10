<script setup lang="ts">
import type { Character } from '@/types/api';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onScopeDispose, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { CHARACTER_PREFETCH_HOVER_MS, prefetchCharacter } from '@/composables/useCharacter';
import { getCharacterStatusClass } from '@/utils/characterStatus';
import LazyImage from './LazyImage.vue';

const props = defineProps<{
  character: Character;
}>();

const queryClient = useQueryClient();
const prefetchTimer = ref<ReturnType<typeof setTimeout> | undefined>();

const statusClass = computed(() => getCharacterStatusClass(props.character.status));

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
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <LazyImage :src="character.image" alt="" :width="300" :height="300" />
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
