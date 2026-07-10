<script setup lang="ts">
import { computed } from 'vue';
import ErrorPageShell from '@/components/ErrorPageShell.vue';
import { buildFatalErrorPageSeo } from '@/seo/errorSeo';
import { usePageSeo } from '@/seo/usePageSeo';

defineOptions({
  name: 'FatalErrorView',
});

const message = computed(
  () => (window.history.state?.message as string | undefined) ?? 'An unknown error occurred in this dimension.',
);

usePageSeo(buildFatalErrorPageSeo());
</script>

<template>
  <ErrorPageShell status-code="500" title="Portal malfunction" :message="message" />
</template>
