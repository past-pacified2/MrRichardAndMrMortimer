import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoadingState from './LoadingState.vue';

describe('characterDetail LoadingState', () => {
  it('renders the detail skeleton', () => {
    const wrapper = mount(LoadingState);

    expect(wrapper.find('[aria-label="Loading character"]').exists()).toBe(true);
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(wrapper.findAll('.bg-white\\/10').length).toBeGreaterThan(0);
  });
});
