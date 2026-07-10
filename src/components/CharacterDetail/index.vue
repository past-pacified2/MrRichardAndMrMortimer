<script setup lang="ts">
import type { Character } from '@/types/api';
import { computed } from 'vue';
import { ApiNotFoundError } from '@/api/rickandmorty';
import ErrorState from '@/components/ErrorState.vue';
import CharacterProfile from './CharacterProfile.vue';
import LoadingState from './LoadingState.vue';

const props = defineProps<{
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  character?: Character;
  error?: Error | null;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const errorMessage = computed(() => {
  if (props.error instanceof Error && props.error.message) {
    return props.error.message;
  }

  return 'Could not load character.';
});
</script>

<template>
  <LoadingState v-if="isPending" />

  <ErrorState
    v-else-if="isError && !(error instanceof ApiNotFoundError)"
    :message="errorMessage"
    @retry="emit('retry')"
  />

  <CharacterProfile v-else-if="isSuccess && character" :character="character" />
</template>
