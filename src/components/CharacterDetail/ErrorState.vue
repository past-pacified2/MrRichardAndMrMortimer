<script setup lang="ts">
defineProps<{
  message?: string;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="rounded-lg border border-white/10 bg-white/5 p-6 text-center" role="alert">
    <p class="mb-4 text-white">
      {{ message ?? 'Something went wrong. Please try again.' }}
    </p>
    <button
      type="button"
      class="cursor-pointer rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:border-white/20"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
