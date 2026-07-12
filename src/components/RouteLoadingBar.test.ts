import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RouteLoadingBar from './RouteLoadingBar.vue';

describe('routeLoadingBar', () => {
  it('is hidden when not loading', () => {
    const wrapper = mount(RouteLoadingBar, {
      props: { isLoading: false },
    });

    expect(wrapper.find('.route-loading').isVisible()).toBe(false);
  });

  it('is visible and accessible when loading', () => {
    const wrapper = mount(RouteLoadingBar, {
      props: { isLoading: true },
    });

    const bar = wrapper.find('.route-loading');

    expect(bar.isVisible()).toBe(true);
    expect(bar.attributes('role')).toBe('progressbar');
    expect(bar.attributes('aria-label')).toBe('Loading page');
    expect(bar.attributes('aria-busy')).toBe('true');
    expect(wrapper.find('.route-loading__bar').exists()).toBe(true);
  });
});
