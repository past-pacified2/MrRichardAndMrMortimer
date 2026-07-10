import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Pagination from './Pagination.vue';

describe('pagination', () => {
  it('renders arrows and the current page window', () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 21,
        totalPages: 42,
      },
    });

    expect(wrapper.get('[aria-label="Previous page"]').text()).toBe('←');
    expect(wrapper.get('[aria-label="Next page"]').text()).toBe('→');
    expect(wrapper.findAll('.pagination__page')).toHaveLength(5);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('21');
    expect(wrapper.text()).toContain('…');
  });

  it('emits the selected page', async () => {
    const wrapper = mount(Pagination, {
      props: {
        currentPage: 2,
        totalPages: 42,
      },
    });

    await wrapper.get('[aria-label="Page 3"]').trigger('click');

    expect(wrapper.emitted('update:page')).toEqual([[3]]);
  });
});
