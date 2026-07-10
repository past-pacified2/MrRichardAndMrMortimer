<script setup lang="ts">
import type { Character, CharacterStatus } from '@/types/api';
import { computed } from 'vue';

const props = defineProps<{
  character: Character;
}>();

const statusClasses: Record<CharacterStatus, string> = {
  Alive: 'bg-green-500/15 text-green-800 dark:text-green-400',
  Dead: 'bg-red-500/15 text-red-800 dark:text-red-400',
  unknown: 'bg-violet-500/15 text-violet-800 dark:text-violet-400',
};

const statusClass = computed(() => statusClasses[props.character.status]);

const episodeCount = computed(() => props.character.episode.length);
</script>

<template>
  <article class="character-profile mx-auto max-w-3xl">
    <div class="character-profile__layout grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start">
      <img
        :src="character.image"
        :alt="character.name"
        width="320"
        height="320"
        class="character-profile__image mx-auto aspect-square w-full max-w-72 rounded-2xl object-cover"
      />

      <div class="character-profile__content mx-auto w-max md:mx-0">
        <h1 id="character-heading" class="character-profile__name mt-0 mb-4 leading-none text-white md:mb-6">
          {{ character.name }}
        </h1>

        <dl class="character-profile__details grid gap-3 text-white">
          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Status</dt>
            <dd>
              <span
                class="character-profile__status inline-block rounded-full px-2 py-0.5 text-sm"
                :class="statusClass"
              >
                {{ character.status }}
              </span>
            </dd>
          </div>

          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Species</dt>
            <dd>{{ character.species }}</dd>
          </div>

          <div v-if="character.type" class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Type</dt>
            <dd>{{ character.type }}</dd>
          </div>

          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Gender</dt>
            <dd>{{ character.gender }}</dd>
          </div>

          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Origin</dt>
            <dd>{{ character.origin.name }}</dd>
          </div>

          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Location</dt>
            <dd>{{ character.location.name }}</dd>
          </div>

          <div class="character-profile__detail grid grid-cols-[6rem_1fr] gap-2">
            <dt class="text-white/70">Episodes</dt>
            <dd>{{ episodeCount }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </article>
</template>
