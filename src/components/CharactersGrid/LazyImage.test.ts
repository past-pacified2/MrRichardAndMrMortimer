import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LazyImage from './LazyImage.vue';

describe('lazyImage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not request the image before intersection', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        alt: 'Rick Sanchez',
      },
    });

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
  });
});
