<script setup lang="ts">
import { computed } from 'vue';
import { useCharacters } from '@/composables/useCharacters';
import CharacterCard from './CharacterCard.vue';
import ErrorState from './ErrorState.vue';
import LoadingState from './LoadingState.vue';

const { isPending, isError, isSuccess, data, error, refetch } = useCharacters();

const errorMessage = computed(() => {
  if (error.value instanceof Error && error.value.message) {
    return error.value.message;
  }

  return 'Could not load characters.';
});

const characters = computed(() => {
  if (!isSuccess.value || !data.value) {
    return [];
  }

  return data.value.results;
});
</script>

<template>
  <LoadingState v-if="isPending" />

  <ErrorState v-else-if="isError" :message="errorMessage" @retry="refetch" />

  <ul v-else-if="isSuccess" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <li v-for="character in characters" :key="character.id">
      <CharacterCard :character="character" />
    </li>
  </ul>
</template>
