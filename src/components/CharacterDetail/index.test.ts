import { VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, ApiNotFoundError } from '@/api/rickandmorty';
import { createTestQueryClient } from '@/composables/test/renderComposable';
import CharacterDetail from './index.vue';
import { mockCharacter } from './test/fixtures';

vi.mock('@/api/rickandmorty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/rickandmorty')>();
  return {
    ...actual,
    fetchCharacter: vi.fn(),
  };
});

const { fetchCharacter } = await import('@/api/rickandmorty');

function mountCharacterDetail(characterId = 1) {
  const queryClient = createTestQueryClient();

  return mount(CharacterDetail, {
    props: { characterId },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });
}

describe('characterDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the loading skeleton while fetching', () => {
    vi.mocked(fetchCharacter).mockImplementation(() => new Promise(() => {}));

    const wrapper = mountCharacterDetail();

    expect(wrapper.find('[aria-label="Loading character"]').exists()).toBe(true);
    expect(wrapper.find('#character-heading').exists()).toBe(false);
  });

  it('renders the character profile when fetch succeeds', async () => {
    vi.mocked(fetchCharacter).mockResolvedValue(mockCharacter);

    const wrapper = mountCharacterDetail();
    await flushPromises();

    expect(wrapper.get('#character-heading').text()).toBe('Rick Sanchez');
    expect(wrapper.find('[aria-label="Loading character"]').exists()).toBe(false);
  });

  it('shows the error state when fetch fails', async () => {
    vi.mocked(fetchCharacter).mockRejectedValue(new ApiError(500, 'Server error'));

    const wrapper = mountCharacterDetail();
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain('Server error');
  });

  it('emits notFound when the character does not exist', async () => {
    vi.mocked(fetchCharacter).mockRejectedValue(new ApiNotFoundError('Character not found'));

    const wrapper = mountCharacterDetail(99999);
    await flushPromises();

    expect(wrapper.emitted('notFound')).toHaveLength(1);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('refetches when retry is clicked', async () => {
    vi.mocked(fetchCharacter)
      .mockRejectedValueOnce(new ApiError(500, 'Server error'))
      .mockResolvedValueOnce(mockCharacter);

    const wrapper = mountCharacterDetail();
    await flushPromises();

    await wrapper.get('button').trigger('click');
    await flushPromises();

    expect(fetchCharacter).toHaveBeenCalledTimes(2);
    expect(wrapper.get('#character-heading').text()).toBe('Rick Sanchez');
  });
});
