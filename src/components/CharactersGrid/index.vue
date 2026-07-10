<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ErrorState from '@/components/ErrorState.vue';
import { useCharacterNameFilter } from '@/composables/useCharacterNameFilter';
import { useCharacters } from '@/composables/useCharacters';
import { buildPageQuery, parseNameQuery, parsePageQuery } from '@/utils/pagination';
import CharacterCard from './CharacterCard.vue';
import LoadingState from './LoadingState.vue';
import Pagination from './Pagination.vue';

const route = useRoute();
const router = useRouter();

const currentPage = computed(() => parsePageQuery(route.query.page));
const nameFilter = computed(() => parseNameQuery(route.query.name));
const initialName = typeof route.query.name === 'string' ? route.query.name : '';
const { filterInput, debouncedInput } = useCharacterNameFilter(initialName);

const { isPending, isError, isSuccess, data, error, refetch } = useCharacters(currentPage, nameFilter);

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

const totalPages = computed(() => data.value?.info.pages ?? 1);

function syncRouteQuery(page: number, name?: string) {
  const nextQuery = buildPageQuery(page, name);
  const currentQuery = route.query;
  const pageMatches = (currentQuery.page ?? undefined) === nextQuery.page;
  const nameMatches = (currentQuery.name ?? undefined) === nextQuery.name;

  if (pageMatches && nameMatches) {
    return;
  }

  void router.replace({ query: nextQuery });
}

function goToPage(page: number) {
  syncRouteQuery(page, nameFilter.value);
}

watch(debouncedInput, (value) => {
  const nextName = parseNameQuery(value);
  const page = nextName !== nameFilter.value ? 1 : currentPage.value;

  syncRouteQuery(page, nextName);
});

watch(
  () => route.query.name,
  (name) => {
    const nextInput = typeof name === 'string' ? name : '';

    if (nextInput !== filterInput.value) {
      filterInput.value = nextInput;
    }
  },
);

watch([data, currentPage], () => {
  const pages = data.value?.info.pages;

  if (pages && currentPage.value > pages) {
    goToPage(pages);
  }
});
</script>

<template>
  <label class="characters-grid__filter mb-6 block">
    <span class="sr-only">Filter by character name</span>
    <input
      v-model="filterInput"
      type="search"
      class="characters-grid__filter-input w-full max-w-md rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder:text-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      placeholder="Filter by name (min 3 characters)"
      aria-label="Filter by character name"
    />
  </label>

  <LoadingState v-if="isPending" />

  <ErrorState v-else-if="isError" :message="errorMessage" @retry="refetch" />

  <div v-else-if="isSuccess">
    <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <li v-for="character in characters" :key="character.id">
        <CharacterCard :character="character" />
      </li>
    </ul>

    <Pagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages" @update:page="goToPage" />
  </div>
</template>
