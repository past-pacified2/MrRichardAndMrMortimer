import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoadingState from './LoadingState.vue';

describe('loadingState', () => {
  it('renders the skeleton grid', () => {
    const wrapper = mount(LoadingState);

    expect(wrapper.find('[aria-label="Loading characters"]').exists()).toBe(true);
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(wrapper.findAll('.animate-pulse')).toHaveLength(8);
  });

  it('renders a custom skeleton count', () => {
    const wrapper = mount(LoadingState, {
      props: { count: 3 },
    });

    expect(wrapper.findAll('.animate-pulse')).toHaveLength(3);
  });
});
