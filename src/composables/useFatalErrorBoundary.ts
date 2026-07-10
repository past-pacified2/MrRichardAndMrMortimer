import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { onErrorCaptured } from 'vue';
import { FATAL_ERROR_DEFAULT_MESSAGE } from '@/constants/errors';

export function shouldRedirectToFatalError(routeName: RouteLocationNormalizedLoaded['name'], isDev: boolean): boolean {
  if (isDev) {
    return false;
  }

  return routeName !== 'fatal-error';
}

export function redirectToFatalError(router: Router, message = FATAL_ERROR_DEFAULT_MESSAGE) {
  void router.replace({
    name: 'fatal-error',
    state: { message },
  });
}

export function useFatalErrorBoundary(
  router: Router,
  route: RouteLocationNormalizedLoaded,
  isDev = import.meta.env.DEV,
) {
  onErrorCaptured((error, _instance, info) => {
    console.error('[App] Unhandled render error:', error, info);

    if (!shouldRedirectToFatalError(route.name, isDev)) {
      return isDev ? undefined : false;
    }

    redirectToFatalError(router);
    return false;
  });
}
