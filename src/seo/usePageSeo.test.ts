import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { buildNotFoundPageSeo } from './errorSeo';
import { homePageSeo } from './site';
import { usePageSeo } from './usePageSeo';

describe('usePageSeo', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('does not reset seo when a newer page has already mounted', async () => {
    const PreviousView = defineComponent({
      setup() {
        usePageSeo(homePageSeo);
        return () => null;
      },
    });

    const NextView = defineComponent({
      setup() {
        usePageSeo(buildNotFoundPageSeo('/character/not-a-character'));
        return () => null;
      },
    });

    const previousWrapper = mount(PreviousView);
    expect(document.title).toBe(homePageSeo.title);

    const nextWrapper = mount(NextView);
    expect(document.title).toBe('Page not found | Mr. Rick & Mr. Mortimer');

    previousWrapper.unmount();
    await nextTick();

    expect(document.title).toBe('Page not found | Mr. Rick & Mr. Mortimer');

    nextWrapper.unmount();
    await nextTick();

    expect(document.title).toBe(homePageSeo.title);
  });
});
