<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { ApiNotFoundError } from '@/api/rickandmorty';
import CharacterDetail from '@/components/CharacterDetail/index.vue';
import { parseCharacterId, useCharacter } from '@/composables/useCharacter';
import { buildCharacterLoadingPageSeo, buildCharacterPageSeo } from '@/seo/characterSeo';
import { usePageSeo } from '@/seo/usePageSeo';

const route = useRoute();
const router = useRouter();

const characterId = computed(() => parseCharacterId(route.params.id as string));
const { isPending, isError, isSuccess, data, error, refetch } = useCharacter(characterId);

watch(
  characterId,
  (id) => {
    if (id === null) {
      router.push({ name: 'not-found' });
    }
  },
  { immediate: true },
);

watch(
  error,
  (value) => {
    if (value instanceof ApiNotFoundError) {
      router.push({ name: 'not-found' });
    }
  },
  { immediate: true },
);

usePageSeo(
  computed(() => {
    if (characterId.value === null) {
      return undefined;
    }

    if (isSuccess.value && data.value) {
      return buildCharacterPageSeo(data.value);
    }

    return buildCharacterLoadingPageSeo(characterId.value);
  }),
);
</script>

<template>
  <section v-if="characterId !== null" aria-labelledby="character-heading">
    <nav class="mb-6">
      <RouterLink
        :to="{ name: 'home' }"
        class="text-lg text-white/70 transition hover:text-white"
        aria-label="Back to characters"
      >
        ← Back to characters
      </RouterLink>
    </nav>

    <CharacterDetail
      :is-pending="isPending"
      :is-error="isError"
      :is-success="isSuccess"
      :character="data"
      :error="error"
      @retry="refetch"
    />
  </section>
</template>
