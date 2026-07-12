<script setup lang="ts">
defineProps<{
  isLoading: boolean;
}>();
</script>

<template>
  <div v-show="isLoading" class="route-loading" role="progressbar" aria-label="Loading page" aria-busy="true">
    <div class="route-loading__bar" />
  </div>
</template>

<style scoped>
.route-loading {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 50;
  height: 3px;
  overflow: hidden;
  pointer-events: none;

  & .route-loading__bar {
    height: 100%;
    background: var(--accent);
    animation: route-loading-indeterminate 1.2s ease-in-out infinite;
  }
}

@keyframes route-loading-indeterminate {
  0% {
    transform: translateX(-100%) scaleX(0.35);
  }

  50% {
    transform: translateX(15%) scaleX(0.65);
  }

  100% {
    transform: translateX(120%) scaleX(0.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading {
    & .route-loading__bar {
      animation: none;
      transform: none;
      width: 100%;
      opacity: 0.75;
    }
  }
}
</style>
