import type { Router } from 'vue-router';
import { useIsFetching } from '@tanstack/vue-query';
import { computed, onScopeDispose, ref, watch } from 'vue';

const SHOW_DELAY_MS = 120;

function useDelayedLoading(isActive: () => boolean) {
  const isLoading = ref(false);
  let showTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    isActive,
    (active) => {
      if (active) {
        if (showTimer === null && !isLoading.value) {
          showTimer = setTimeout(() => {
            showTimer = null;

            if (isActive()) {
              isLoading.value = true;
            }
          }, SHOW_DELAY_MS);
        }

        return;
      }

      if (showTimer !== null) {
        clearTimeout(showTimer);
        showTimer = null;
      }

      isLoading.value = false;
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    if (showTimer !== null) {
      clearTimeout(showTimer);
    }
  });

  return { isLoading };
}

function useRoutePending(router: Router) {
  const isRoutePending = ref(false);
  let pendingCount = 0;

  function startRoutePending() {
    pendingCount += 1;

    if (pendingCount === 1) {
      isRoutePending.value = true;
    }
  }

  function stopRoutePending() {
    pendingCount = Math.max(0, pendingCount - 1);

    if (pendingCount === 0) {
      isRoutePending.value = false;
    }
  }

  const removeBefore = router.beforeEach((_to, _from, next) => {
    startRoutePending();
    next();
  });

  const removeAfter = router.afterEach(() => {
    stopRoutePending();
  });

  const removeError = router.onError(() => {
    stopRoutePending();
  });

  onScopeDispose(() => {
    removeBefore();
    removeAfter();
    removeError();
  });

  return isRoutePending;
}

export function useAppLoading(router: Router) {
  const isRoutePending = useRoutePending(router);
  const fetchingCount = useIsFetching();
  const isActive = computed(() => isRoutePending.value || fetchingCount.value > 0);

  return useDelayedLoading(() => isActive.value);
}
