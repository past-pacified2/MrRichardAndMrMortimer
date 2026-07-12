import { useQuery } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createTestQueryClient, renderComposable } from '@/composables/test/renderComposable';
import { useAppLoading } from './useAppLoading';

function createSlowRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: defineComponent({ template: '<div>Home</div>' }) },
      {
        path: '/slow',
        name: 'slow',
        component: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(defineComponent({ template: '<div>Slow</div>' }));
            }, 200);
          }),
      },
    ],
  });
}

describe('useAppLoading', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading after a short delay during navigation', async () => {
    vi.useFakeTimers();

    const router = createSlowRouter();
    await router.push('/');
    await router.isReady();

    const { result } = renderComposable(() => useAppLoading(router), { router });

    expect(result.isLoading.value).toBe(false);

    const navigation = router.push('/slow');
    await vi.advanceTimersByTimeAsync(120);

    expect(result.isLoading.value).toBe(true);

    await vi.advanceTimersByTimeAsync(200);
    await navigation;
    await flushPromises();

    expect(result.isLoading.value).toBe(false);
  });

  it('does not flash loading for fast navigations', async () => {
    vi.useFakeTimers();

    const router = createSlowRouter();
    await router.push('/');
    await router.isReady();

    const { result } = renderComposable(() => useAppLoading(router), { router });

    void router.push('/slow');
    await vi.advanceTimersByTimeAsync(50);
    await flushPromises();

    expect(result.isLoading.value).toBe(false);
  });

  it('shows loading during a slow query fetch', async () => {
    vi.useFakeTimers();

    const router = createSlowRouter();
    await router.push('/');
    await router.isReady();

    const queryClient = createTestQueryClient();
    const { result } = renderComposable(
      () => {
        useQuery({
          queryKey: ['slow-query'],
          queryFn: () =>
            new Promise<string>((resolve) => {
              setTimeout(resolve, 500, 'done');
            }),
        });

        return useAppLoading(router);
      },
      { router, queryClient },
    );

    expect(result.isLoading.value).toBe(false);

    await vi.advanceTimersByTimeAsync(120);

    expect(result.isLoading.value).toBe(true);

    await vi.advanceTimersByTimeAsync(500);
    await flushPromises();

    expect(result.isLoading.value).toBe(false);
  });
});
