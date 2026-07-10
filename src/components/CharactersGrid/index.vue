<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCharacters } from '@/composables/useCharacters';
import { buildPageQuery, parsePageQuery } from '@/utils/pagination';
import CharacterCard from './CharacterCard.vue';
import ErrorState from './ErrorState.vue';
import LoadingState from './LoadingState.vue';
import Pagination from './Pagination.vue';

const route = useRoute();
const router = useRouter();

const currentPage = computed(() => parsePageQuery(route.query.page));

const { isPending, isError, isSuccess, data, error, refetch } = useCharacters(currentPage);

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

function goToPage(page: number) {
  void router.replace({ query: buildPageQuery(page) });
}

watch([data, currentPage], () => {
  const pages = data.value?.info.pages;

  if (pages && currentPage.value > pages) {
    goToPage(pages);
  }
});
</script>

<template>
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
