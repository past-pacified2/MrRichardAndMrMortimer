<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ErrorPageShell from '@/components/ErrorPageShell.vue';
import { buildNotFoundPageSeo } from '@/seo/errorSeo';
import { usePageSeo } from '@/seo/usePageSeo';

defineOptions({
  name: 'FourhOhFourView',
});

const route = useRoute();

usePageSeo(computed(() => buildNotFoundPageSeo(route.fullPath)));
</script>

<template>
  <ErrorPageShell
    status-code="404"
    title="Dimension not found"
    message="This page wandered into the wrong universe. The portal may have glitched, or that character never existed."
  />
</template>
