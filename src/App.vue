<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router';

import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import RouteLoadingBar from '@/components/RouteLoadingBar.vue';
import { useAppLoading } from '@/composables/useAppLoading';
import { useFatalErrorBoundary } from '@/composables/useFatalErrorBoundary';

const router = useRouter();
const route = useRoute();

useFatalErrorBoundary(router, route);
const { isLoading } = useAppLoading(router);
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <RouteLoadingBar :is-loading="isLoading" />

  <Header />

  <main id="main-content" class="container mx-auto px-4 py-4 md:px-6 lg:px-8" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <KeepAlive include="HomeView">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </main>

  <Footer class="mt-auto" />
</template>
