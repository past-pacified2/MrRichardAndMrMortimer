import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import CharacterCard from './CharacterCard.vue';
import { mockCharacter } from './test/fixtures';

function createCharacterRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } as Component },
      { path: '/character/:id', name: 'character', component: { template: '<div />' } as Component },
    ],
  });
}

describe('characterCard', () => {
  it('renders name, status, and species from props', () => {
    const router = createCharacterRouter();
    const wrapper = mount(CharacterCard, {
      props: { character: mockCharacter },
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Rick Sanchez');
    expect(wrapper.text()).toContain('Alive');
    expect(wrapper.text()).toContain('Human');
  });

  it('links to the character detail route', () => {
    const router = createCharacterRouter();
    const wrapper = mount(CharacterCard, {
      props: { character: mockCharacter },
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.get('a').attributes('href')).toBe('/character/1');
    expect(wrapper.get('a').attributes('aria-label')).toBe("View Rick Sanchez's details");
  });
});
