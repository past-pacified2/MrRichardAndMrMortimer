import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { mockCharacter } from '@/test/fixtures/character';
import CharacterProfile from './CharacterProfile.vue';

describe('characterProfile', () => {
  it('renders character details from props', () => {
    const wrapper = mount(CharacterProfile, {
      props: { character: mockCharacter },
    });

    expect(wrapper.get('#character-heading').text()).toBe('Rick Sanchez');
    expect(wrapper.text()).toContain('Alive');
    expect(wrapper.text()).toContain('Human');
    expect(wrapper.text()).toContain('Male');
    expect(wrapper.text()).toContain('Earth (C-137)');
    expect(wrapper.text()).toContain('Earth (Replacement Dimension)');
    expect(wrapper.text()).toContain('2');
  });

  it('hides the type row when type is empty', () => {
    const wrapper = mount(CharacterProfile, {
      props: { character: mockCharacter },
    });

    expect(wrapper.text()).not.toContain('Type');
  });

  it('shows the type row when type is present', () => {
    const wrapper = mount(CharacterProfile, {
      props: {
        character: {
          ...mockCharacter,
          type: 'Cronenberg',
        },
      },
    });

    expect(wrapper.text()).toContain('Type');
    expect(wrapper.text()).toContain('Cronenberg');
  });
});
