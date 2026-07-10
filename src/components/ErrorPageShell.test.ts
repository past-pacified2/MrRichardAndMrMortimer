import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import ErrorPageShell from './ErrorPageShell.vue';

function mountErrorPageShell(props: Partial<{ statusCode: string; title: string; message: string }> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  });

  return mount(ErrorPageShell, {
    props: {
      statusCode: '404',
      title: 'Dimension not found',
      message: 'This page wandered into the wrong universe.',
      ...props,
    },
    global: {
      plugins: [router],
    },
  });
}

describe('errorPageShell', () => {
  it('renders the status code, title, and message', () => {
    const wrapper = mountErrorPageShell();

    expect(wrapper.find('.error-page__code').text()).toBe('404');
    expect(wrapper.get('#error-heading').text()).toBe('Dimension not found');
    expect(wrapper.find('.error-page__message').text()).toBe('This page wandered into the wrong universe.');
  });

  it('links back to the home page', () => {
    const wrapper = mountErrorPageShell();

    expect(wrapper.get('.error-page__action').attributes('href')).toBe('/');
    expect(wrapper.get('.error-page__action').text()).toBe('Back to characters');
  });
});
