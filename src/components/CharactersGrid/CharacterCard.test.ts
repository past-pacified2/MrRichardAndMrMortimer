import type { Component } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createTestQueryClient } from '@/composables/test/renderComposable';
import { CHARACTER_PREFETCH_HOVER_MS, characterQueryOptions } from '@/composables/useCharacter';
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

function mountCharacterCard() {
  const queryClient = createTestQueryClient();
  const router = createCharacterRouter();

  const wrapper = mount(CharacterCard, {
    props: { character: mockCharacter },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }], router],
    },
  });

  return { wrapper, queryClient };
}

describe('characterCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders name, status, and species from props', () => {
    const { wrapper } = mountCharacterCard();

    expect(wrapper.text()).toContain('Rick Sanchez');
    expect(wrapper.text()).toContain('Alive');
    expect(wrapper.text()).toContain('Human');
  });

  it('links to the character detail route', () => {
    const { wrapper } = mountCharacterCard();

    expect(wrapper.get('a').attributes('href')).toBe('/character/1');
    expect(wrapper.get('a').attributes('aria-label')).toBe("View Rick Sanchez's details");
  });

  it('does not prefetch immediately on hover', async () => {
    const { wrapper, queryClient } = mountCharacterCard();
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery').mockResolvedValue(undefined);

    await wrapper.get('a').trigger('mouseenter');

    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it('prefetches after the hover delay', async () => {
    const { wrapper, queryClient } = mountCharacterCard();
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery').mockResolvedValue(undefined);

    await wrapper.get('a').trigger('mouseenter');
    vi.advanceTimersByTime(CHARACTER_PREFETCH_HOVER_MS);

    expect(prefetchSpy).toHaveBeenCalledOnce();
    expect(prefetchSpy.mock.calls[0]?.[0]).toMatchObject({
      queryKey: ['character', mockCharacter.id],
      staleTime: characterQueryOptions(mockCharacter.id).staleTime,
      retry: false,
    });
  });

  it('cancels prefetch when the pointer leaves before the delay', async () => {
    const { wrapper, queryClient } = mountCharacterCard();
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery').mockResolvedValue(undefined);

    await wrapper.get('a').trigger('mouseenter');
    vi.advanceTimersByTime(CHARACTER_PREFETCH_HOVER_MS - 1);
    await wrapper.get('a').trigger('mouseleave');
    vi.advanceTimersByTime(CHARACTER_PREFETCH_HOVER_MS);

    expect(prefetchSpy).not.toHaveBeenCalled();
  });
});
