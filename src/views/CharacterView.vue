<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ApiNotFoundError } from '@/api/rickandmorty';
import CharacterDetail from '@/components/CharacterDetail/index.vue';
import { parseCharacterId, useCharacter } from '@/composables/useCharacter';
import { buildCharacterLoadingPageSeo, buildCharacterPageSeo } from '@/seo/characterSeo';
import { usePageSeo } from '@/seo/usePageSeo';

const route = useRoute();
const router = useRouter();

const characterId = computed(() => parseCharacterId(route.params.id as string));
const { isPending, isError, isSuccess, data, error, refetch } = useCharacter(characterId);

function redirectToNotFound() {
  void router.replace({
    name: 'not-found',
    params: {
      pathMatch: route.path.split('/').filter(Boolean),
    },
    query: route.query,
    hash: route.hash,
  });
}

watch(
  characterId,
  (id) => {
    if (id === null) {
      redirectToNotFound();
    }
  },
  { immediate: true },
);

watch(
  error,
  (value) => {
    if (value instanceof ApiNotFoundError) {
      redirectToNotFound();
    }
  },
  { immediate: true },
);

function goBack(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }

  if (window.history.state?.back) {
    event.preventDefault();
    router.back();
  }
}

const sectionLabel = computed(() => {
  if (isSuccess.value && data.value) {
    return data.value.name;
  }

  if (isError.value) {
    return 'Character error';
  }

  return `Character #${characterId.value}`;
});

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
  <section v-if="characterId !== null" :aria-label="sectionLabel">
    <nav class="mb-6" aria-label="Breadcrumb">
      <a
        href="/"
        class="text-lg text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="goBack"
      >
        ← Back to characters
      </a>
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
