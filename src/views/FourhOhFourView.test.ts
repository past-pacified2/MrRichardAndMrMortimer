import type { Component } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import FourhOhFourView from './FourhOhFourView.vue';

async function mountFourhOhFourView(path = '/character/99999') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: FourhOhFourView },
    ],
  });

  await router.push(path);

  const wrapper = mount(FourhOhFourView, {
    global: {
      plugins: [router],
    },
  });

  await flushPromises();

  return wrapper;
}

describe('fourhOhFourView', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('renders the 404 content', async () => {
    const wrapper = await mountFourhOhFourView();

    expect(wrapper.find('.error-page__code').text()).toBe('404');
    expect(wrapper.get('#error-heading').text()).toBe('Dimension not found');
    expect(wrapper.text()).toContain('This page wandered into the wrong universe.');
  });

  it('links back to the home page', async () => {
    const wrapper = await mountFourhOhFourView();

    expect(wrapper.get('.error-page__action').attributes('href')).toBe('/');
  });

  it('applies noindex seo for the current route path', async () => {
    await mountFourhOhFourView('/character/99999');

    expect(document.title).toBe('Page not found | Mr. Rick & Mr. Mortimer');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/character/99999');
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain('Page not found');
  });
});
