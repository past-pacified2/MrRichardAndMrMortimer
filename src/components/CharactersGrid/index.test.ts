import type { Component } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError } from '@/api/rickandmorty';
import { createTestQueryClient } from '@/composables/test/renderComposable';
import CharactersGrid from './index.vue';
import { mockCharactersResponse } from './test/fixtures';

vi.mock('@/api/rickandmorty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/rickandmorty')>();
  return {
    ...actual,
    fetchCharacters: vi.fn(),
  };
});

const { fetchCharacters } = await import('@/api/rickandmorty');

function mountCharactersGrid() {
  const queryClient = createTestQueryClient();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/character/:id', name: 'character', component: { template: '<div />' } as Component },
    ],
  });

  return mount(CharactersGrid, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }], router],
    },
  });
}

describe('charactersGrid', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading skeleton while fetching', () => {
    vi.mocked(fetchCharacters).mockImplementation(() => new Promise(() => {}));

    const wrapper = mountCharactersGrid();

    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(true);
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('renders character cards when fetch succeeds', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const wrapper = mountCharactersGrid();
    await flushPromises();

    expect(wrapper.text()).toContain('Rick Sanchez');
    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(false);
    expect(wrapper.findAll('li')).toHaveLength(1);
  });

  it('shows the error state when fetch fails', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new ApiError(500, 'Server error'));

    const wrapper = mountCharactersGrid();
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain('Server error');
    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(false);
  });

  it('refetches when retry is clicked', async () => {
    vi.mocked(fetchCharacters)
      .mockRejectedValueOnce(new ApiError(500, 'Server error'))
      .mockResolvedValueOnce(mockCharactersResponse);

    const wrapper = mountCharactersGrid();
    await flushPromises();

    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('Rick Sanchez');
  });
});
