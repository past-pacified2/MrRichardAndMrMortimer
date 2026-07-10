import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import Header from './Header.vue';

function mountHeader() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  });

  return mount(Header, {
    global: {
      plugins: [router],
    },
  });
}

describe('header', () => {
  it('renders the site logo linking to home', () => {
    const wrapper = mountHeader();

    const homeLink = wrapper.get('a[aria-label="Go to home"]');
    expect(homeLink.attributes('href')).toBe('/');
    expect(wrapper.find('img[alt=""]').exists()).toBe(true);
  });
});
