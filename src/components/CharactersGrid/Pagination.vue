<script setup lang="ts">
import { computed } from 'vue';
import { buildPaginationItems } from '@/utils/pagination';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  'update:page': [page: number];
}>();

const hasPrev = computed(() => props.currentPage > 1);
const hasNext = computed(() => props.currentPage < props.totalPages);
const items = computed(() => buildPaginationItems(props.currentPage, props.totalPages));

const arrowButtonClass =
  'pagination__arrow cursor-pointer rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40';

const pageButtonClass =
  'pagination__page min-w-10 cursor-pointer rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default disabled:border-white/30 disabled:bg-white/15';
</script>

<template>
  <nav class="pagination mt-8 flex items-center justify-center gap-2" aria-label="Characters pagination">
    <button
      type="button"
      :class="arrowButtonClass"
      :disabled="!hasPrev"
      aria-label="Previous page"
      @click="emit('update:page', currentPage - 1)"
    >
      ←
    </button>

    <ol class="pagination__pages flex items-center gap-1" aria-live="polite">
      <li v-for="(item, index) in items" :key="`${item.type}-${index}`">
        <button
          v-if="item.type === 'page'"
          type="button"
          :class="pageButtonClass"
          :aria-label="`Page ${item.page}`"
          :aria-current="item.page === currentPage ? 'page' : undefined"
          :disabled="item.page === currentPage"
          @click="emit('update:page', item.page)"
        >
          {{ item.page }}
        </button>

        <span v-else class="pagination__ellipsis px-2 text-white/50" aria-hidden="true">…</span>
      </li>
    </ol>

    <button
      type="button"
      :class="arrowButtonClass"
      :disabled="!hasNext"
      aria-label="Next page"
      @click="emit('update:page', currentPage + 1)"
    >
      →
    </button>
  </nav>
</template>
