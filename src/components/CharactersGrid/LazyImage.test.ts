import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LazyImage from './LazyImage.vue';

const { useIntersectionObserverMock } = vi.hoisted(() => ({
  useIntersectionObserverMock: vi.fn(),
}));

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>();

  return {
    ...actual,
    useIntersectionObserver: useIntersectionObserverMock,
  };
});

describe('lazyImage', () => {
  let observerCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    observerCallback = null;

    useIntersectionObserverMock.mockImplementation((_target, callback) => {
      observerCallback = callback;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createIntersectionEntry(target: Element): IntersectionObserverEntry {
    const rect = target.getBoundingClientRect();

    return {
      isIntersecting: true,
      target,
      boundingClientRect: rect,
      intersectionRatio: 1,
      intersectionRect: rect,
      rootBounds: null,
      time: 0,
    };
  }

  function intersect() {
    observerCallback?.([createIntersectionEntry(document.createElement('div'))], {} as IntersectionObserver);
  }

  it('does not request the image before intersection', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        alt: 'Rick Sanchez',
      },
    });

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.character-card__image-placeholder').exists()).toBe(true);
  });

  it('keeps the placeholder visible while the image is loading', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        alt: 'Rick Sanchez',
      },
    });

    intersect();
    await flushPromises();

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('.character-card__image-placeholder').exists()).toBe(true);
    expect(wrapper.find('img').classes()).toContain('opacity-0');
  });

  it('removes the placeholder after the image loads', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        alt: 'Rick Sanchez',
      },
    });

    intersect();
    await flushPromises();

    await wrapper.find('img').trigger('load');

    expect(wrapper.find('.character-card__image-placeholder').exists()).toBe(false);
    expect(wrapper.find('img').classes()).not.toContain('opacity-0');
  });
});
