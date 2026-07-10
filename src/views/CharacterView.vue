<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import CharacterDetail from '@/components/CharacterDetail/index.vue';
import { parseCharacterId } from '@/composables/useCharacter';

const route = useRoute();
const router = useRouter();

const characterId = computed(() => parseCharacterId(route.params.id as string));

watch(
  characterId,
  (id) => {
    if (id === null) {
      router.push({ name: 'not-found' });
    }
  },
  { immediate: true },
);

function redirectToNotFound() {
  router.push({ name: 'not-found' });
}
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

    <CharacterDetail :character-id="characterId" @not-found="redirectToNotFound" />
  </section>
</template>
