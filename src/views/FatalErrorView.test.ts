import type { Component } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import FatalErrorView from './FatalErrorView.vue';

async function mountFatalErrorView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/500', name: 'fatal-error', component: FatalErrorView },
    ],
  });

  await router.push('/500');

  const wrapper = mount(FatalErrorView, {
    global: {
      plugins: [router],
    },
  });

  await flushPromises();

  return wrapper;
}

describe('fatalErrorView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
    document.title = '';
  });

  it('renders the 500 content with the default message', async () => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({});

    const wrapper = await mountFatalErrorView();

    expect(wrapper.find('.error-page__code').text()).toBe('500');
    expect(wrapper.get('#error-heading').text()).toBe('Portal malfunction');
    expect(wrapper.text()).toContain('An unknown error occurred in this dimension.');
  });

  it('renders a custom message from history state', async () => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({ message: 'Portal coil exploded.' });

    const wrapper = await mountFatalErrorView();

    expect(wrapper.text()).toContain('Portal coil exploded.');
  });

  it('links back to the home page', async () => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({});

    const wrapper = await mountFatalErrorView();

    expect(wrapper.get('.error-page__action').attributes('href')).toBe('/');
  });

  it('applies noindex seo for the fatal error route', async () => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({});

    await mountFatalErrorView();

    expect(document.title).toBe('Something went wrong | Mr. Rick & Mr. Mortimer');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/500');
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain('Something went wrong');
  });
});
