import type { QueryClient } from '@tanstack/vue-query';
import type { Component } from 'vue';
import type { Router } from 'vue-router';
import { QueryClient as QueryClientConstructor, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

export function createTestQueryClient() {
  return new QueryClientConstructor({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/404', name: 'not-found', component: { template: '<div />' } as Component },
    ],
  });
}

export function renderComposable<T>(
  composable: () => T,
  options: {
    queryClient?: QueryClient;
    router?: Router;
  } = {},
) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const router = options.router ?? createTestRouter();

  let result!: T;

  const wrapper = mount(
    defineComponent({
      setup() {
        result = composable();
        return () => null;
      },
    }),
    {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }], router],
      },
    },
  );

  return { result, wrapper, queryClient, router };
}
