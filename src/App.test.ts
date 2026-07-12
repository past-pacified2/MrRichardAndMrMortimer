import type { Component } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createTestQueryClient } from '@/composables/test/renderComposable';
import App from './App.vue';
import FatalErrorView from './views/FatalErrorView.vue';

const ThrowingView = defineComponent({
  name: 'ThrowingView',
  setup() {
    throw new Error('Render exploded');
  },
  render: () => h('div'),
});

const StableView = defineComponent({
  name: 'StableView',
  render: () => h('div', 'stable'),
});

async function mountApp(initialPath: string, view: Component, options: { errorHandler?: (err: unknown) => void } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: view },
      { path: '/500', name: 'fatal-error', component: FatalErrorView },
    ],
  });

  const queryClient = createTestQueryClient();

  const wrapper = mount(App, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }], router],
      config: options.errorHandler
        ? {
            errorHandler: options.errorHandler,
          }
        : undefined,
    },
  });

  await router.push(initialPath);
  await flushPromises();

  return { wrapper, router };
}

describe('app error boundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('redirects to fatal-error when a routed view throws in production', async () => {
    vi.stubEnv('DEV', false);

    const { router } = await mountApp('/', ThrowingView);

    expect(router.currentRoute.value.name).toBe('fatal-error');
    expect(router.currentRoute.value.path).toBe('/500');
  });

  it('does not redirect when a routed view throws in development', async () => {
    vi.stubEnv('DEV', true);
    const errorHandler = vi.fn();

    const { router } = await mountApp('/', ThrowingView, { errorHandler });

    expect(router.currentRoute.value.name).toBe('home');
    expect(errorHandler).toHaveBeenCalled();
  });

  it('does not redirect away from fatal-error when that view throws in production', async () => {
    vi.stubEnv('DEV', false);

    const { router } = await mountApp('/500', ThrowingView);

    expect(router.currentRoute.value.name).toBe('fatal-error');
  });

  it('leaves stable routes untouched in production', async () => {
    vi.stubEnv('DEV', false);

    const { router } = await mountApp('/', StableView);

    expect(router.currentRoute.value.name).toBe('home');
  });
});
