import type { Router } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import { FATAL_ERROR_DEFAULT_MESSAGE } from '@/constants/errors';
import { redirectToFatalError, shouldRedirectToFatalError } from './useFatalErrorBoundary';

describe('shouldRedirectToFatalError', () => {
  it('does not redirect in development', () => {
    expect(shouldRedirectToFatalError('home', true)).toBe(false);
  });

  it('redirects in production for normal routes', () => {
    expect(shouldRedirectToFatalError('home', false)).toBe(true);
    expect(shouldRedirectToFatalError('character', false)).toBe(true);
  });

  it('does not redirect when already on the fatal error route', () => {
    expect(shouldRedirectToFatalError('fatal-error', false)).toBe(false);
  });
});

describe('redirectToFatalError', () => {
  it('navigates to the fatal error route with a safe default message', () => {
    const replace = vi.fn().mockResolvedValue(undefined);
    const router = { replace } as unknown as Router;

    redirectToFatalError(router);

    expect(replace).toHaveBeenCalledWith({
      name: 'fatal-error',
      state: { message: FATAL_ERROR_DEFAULT_MESSAGE },
    });
  });
});
