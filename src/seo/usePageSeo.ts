import type { MaybeRefOrGetter } from 'vue';
import type { PageSeo } from './pageSeo';
import { onUnmounted, toValue, watchEffect } from 'vue';
import { applyPageSeo, resetPageSeo } from './pageSeo';
import { SITE_URL } from './site';

let activeSeoGeneration = 0;

export function usePageSeo(seo: MaybeRefOrGetter<PageSeo | undefined>) {
  const generation = ++activeSeoGeneration;

  watchEffect(() => {
    const value = toValue(seo);

    if (value) {
      applyPageSeo(value, SITE_URL);
    }
  });

  onUnmounted(() => {
    if (generation === activeSeoGeneration) {
      resetPageSeo(SITE_URL);
    }
  });
}
