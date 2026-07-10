<script setup lang="ts">
import { computed, toRef, watch } from 'vue';
import { ApiNotFoundError } from '@/api/rickandmorty';
import { useCharacter } from '@/composables/useCharacter';
import CharacterProfile from './CharacterProfile.vue';
import ErrorState from './ErrorState.vue';
import LoadingState from './LoadingState.vue';

const props = defineProps<{
  characterId: number;
}>();

const emit = defineEmits<{
  notFound: [];
}>();

const { isPending, isError, isSuccess, data, error, refetch } = useCharacter(toRef(props, 'characterId'));

watch(
  error,
  (value) => {
    if (value instanceof ApiNotFoundError) {
      emit('notFound');
    }
  },
  { immediate: true },
);

const errorMessage = computed(() => {
  if (error.value instanceof Error && error.value.message) {
    return error.value.message;
  }

  return 'Could not load character.';
});
</script>

<template>
  <LoadingState v-if="isPending" />

  <ErrorState v-else-if="isError && !(error instanceof ApiNotFoundError)" :message="errorMessage" @retry="refetch" />

  <CharacterProfile v-else-if="isSuccess && data" :character="data" />
</template>
