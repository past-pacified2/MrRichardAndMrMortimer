import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ErrorState from './ErrorState.vue';

describe('errorState', () => {
  it('displays the provided message', () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Could not load characters.' },
    });

    expect(wrapper.get('[role="alert"]').text()).toContain('Could not load characters.');
  });

  it('falls back to a default message', () => {
    const wrapper = mount(ErrorState);

    expect(wrapper.text()).toContain('Something went wrong. Please try again.');
  });

  it('emits retry when the button is clicked', async () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Server error' },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
