import type { MaybeRefOrGetter } from 'vue';
import type { PageSeo } from './pageSeo';
import { onUnmounted, toValue, watchEffect } from 'vue';
import { applyPageSeo, resetPageSeo } from './pageSeo';
import { SITE_URL } from './site';

export function usePageSeo(seo: MaybeRefOrGetter<PageSeo | undefined>) {
  watchEffect(() => {
    const value = toValue(seo);

    if (value) {
      applyPageSeo(value, SITE_URL);
    }
  });

  onUnmounted(() => {
    resetPageSeo(SITE_URL);
  });
}
