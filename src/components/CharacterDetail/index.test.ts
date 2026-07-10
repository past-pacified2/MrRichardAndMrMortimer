import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { ApiError, ApiNotFoundError } from '@/api/rickandmorty';
import { mockCharacter } from '@/test/fixtures/character';
import CharacterDetail from './index.vue';

function mountCharacterDetail(props: Partial<InstanceType<typeof CharacterDetail>['$props']> = {}) {
  return mount(CharacterDetail, {
    props: {
      isPending: false,
      isError: false,
      isSuccess: false,
      character: undefined,
      error: null,
      ...props,
    },
  });
}

describe('characterDetail', () => {
  it('shows the loading skeleton while fetching', () => {
    const wrapper = mountCharacterDetail({ isPending: true });

    expect(wrapper.find('[aria-label="Loading character"]').exists()).toBe(true);
    expect(wrapper.find('#character-heading').exists()).toBe(false);
  });

  it('renders the character profile when fetch succeeds', () => {
    const wrapper = mountCharacterDetail({
      isSuccess: true,
      character: mockCharacter,
    });

    expect(wrapper.get('#character-heading').text()).toBe('Rick Sanchez');
    expect(wrapper.find('[aria-label="Loading character"]').exists()).toBe(false);
  });

  it('shows the error state when fetch fails', () => {
    const wrapper = mountCharacterDetail({
      isError: true,
      error: new ApiError(500, 'Server error'),
    });

    expect(wrapper.get('[role="alert"]').text()).toContain('Server error');
  });

  it('does not show the error state for a missing character', () => {
    const wrapper = mountCharacterDetail({
      isError: true,
      error: new ApiNotFoundError('Character not found'),
    });

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('emits retry when retry is clicked', async () => {
    const wrapper = mountCharacterDetail({
      isError: true,
      error: new ApiError(500, 'Server error'),
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
