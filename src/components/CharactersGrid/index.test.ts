import type { Component } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError, ApiNotFoundError } from '@/api/rickandmorty';
import { createTestQueryClient } from '@/composables/test/renderComposable';
import { mockCharactersResponse } from '@/test/fixtures/character';
import CharactersGrid from './index.vue';

vi.mock('@/api/rickandmorty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/rickandmorty')>();
  return {
    ...actual,
    fetchCharacters: vi.fn(),
  };
});

const { fetchCharacters } = await import('@/api/rickandmorty');

const fetchOptions = { signal: expect.any(AbortSignal) };

async function mountCharactersGrid(initialPath = '/') {
  const queryClient = createTestQueryClient();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/character/:id', name: 'character', component: { template: '<div />' } as Component },
    ],
  });

  await router.push(initialPath);
  await router.isReady();

  const wrapper = mount(CharactersGrid, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }], router],
    },
  });

  return { wrapper, router };
}

describe('charactersGrid', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading skeleton while fetching', async () => {
    vi.mocked(fetchCharacters).mockImplementation(() => new Promise(() => {}));

    const { wrapper } = await mountCharactersGrid();

    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(true);
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('renders character cards when fetch succeeds', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();

    expect(wrapper.text()).toContain('Rick Sanchez');
    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(false);
    expect(wrapper.findAll('.grid li')).toHaveLength(1);
  });

  it('shows the error state when fetch fails', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new ApiError(500, 'Server error'));

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain('Server error');
    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(false);
  });

  it('refetches when retry is clicked', async () => {
    vi.mocked(fetchCharacters)
      .mockRejectedValueOnce(new ApiError(500, 'Server error'))
      .mockResolvedValueOnce(mockCharactersResponse);

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();

    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('Rick Sanchez');
  });

  it('fetches the page from the url query param', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    await mountCharactersGrid('/?page=2');
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 2 }, fetchOptions);
  });

  it('updates the url when the next page is selected', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper, router } = await mountCharactersGrid();
    await flushPromises();

    await wrapper.get('[aria-label="Next page"]').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.query.page).toBe('2');
    expect(fetchCharacters).toHaveBeenCalledWith({ page: 2 }, fetchOptions);
  });

  it('hides pagination when there is only one page', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue({
      ...mockCharactersResponse,
      info: { ...mockCharactersResponse.info, pages: 1, next: null },
    });

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();

    expect(wrapper.find('[aria-label="Characters pagination"]').exists()).toBe(false);
  });

  it('does not query by name until at least 3 characters are entered', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();
    vi.mocked(fetchCharacters).mockClear();

    const filterInput = wrapper.get('[aria-label="Filter by character name"]');
    await filterInput.setValue('Ri');
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(fetchCharacters).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('queries by name after debouncing once 3 characters are entered', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper, router } = await mountCharactersGrid();
    await flushPromises();
    vi.mocked(fetchCharacters).mockClear();

    const filterInput = wrapper.get('[aria-label="Filter by character name"]');
    await filterInput.setValue('Rick');
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1, name: 'Rick' }, fetchOptions);
    expect(router.currentRoute.value.query.name).toBe('Rick');

    vi.useRealTimers();
  });

  it('loads a name filter from the url query param', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper } = await mountCharactersGrid('/?name=Rick');
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1, name: 'Rick' }, fetchOptions);
    expect((wrapper.get('[aria-label="Filter by character name"]').element as HTMLInputElement).value).toBe('Rick');
  });

  it('preserves the name filter when paginating', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper, router } = await mountCharactersGrid('/?name=Rick');
    await flushPromises();

    await wrapper.get('[aria-label="Next page"]').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ page: '2', name: 'Rick' });
    expect(fetchCharacters).toHaveBeenCalledWith({ page: 2, name: 'Rick' }, fetchOptions);
  });

  it('does not query while the user is still typing', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper } = await mountCharactersGrid();
    await flushPromises();
    vi.mocked(fetchCharacters).mockClear();

    const filterInput = wrapper.get('[aria-label="Filter by character name"]');
    await filterInput.setValue('R');
    await vi.advanceTimersByTimeAsync(100);
    await filterInput.setValue('Ri');
    await vi.advanceTimersByTimeAsync(100);
    await filterInput.setValue('Rick');
    await vi.advanceTimersByTimeAsync(299);
    await flushPromises();

    expect(fetchCharacters).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1, name: 'Rick' }, fetchOptions);

    vi.useRealTimers();
  });

  it('removes the name filter from the url when the input is cleared', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { wrapper, router } = await mountCharactersGrid('/?name=Rick');
    await flushPromises();
    vi.mocked(fetchCharacters).mockClear();

    await wrapper.get('[aria-label="Filter by character name"]').setValue('');
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(router.currentRoute.value.query.name).toBeUndefined();
    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1 }, fetchOptions);

    vi.useRealTimers();
  });

  it('shows an empty state when a name filter matches nothing', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new ApiNotFoundError('There is nothing here'));

    const { wrapper } = await mountCharactersGrid('/?name=NO_CHARACTER_LIKE_THIS');
    await flushPromises();

    expect(wrapper.find('.characters-grid__empty').text()).toContain('No characters match your search');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('ul').exists()).toBe(false);
  });
});
