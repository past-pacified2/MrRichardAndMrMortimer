import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.vue';

describe('footer', () => {
  it('renders the copyright notice with the current year', () => {
    const wrapper = mount(Footer);

    expect(wrapper.text()).toContain(String(new Date().getFullYear()));
    expect(wrapper.text()).toContain('Rick & Morty API SPA');
  });
});
