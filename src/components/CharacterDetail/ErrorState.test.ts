import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ErrorState from './ErrorState.vue';

describe('characterDetail ErrorState', () => {
  it('displays the provided message', () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Could not load character.' },
    });

    expect(wrapper.get('[role="alert"]').text()).toContain('Could not load character.');
  });

  it('emits retry when the button is clicked', async () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Server error' },
    });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
