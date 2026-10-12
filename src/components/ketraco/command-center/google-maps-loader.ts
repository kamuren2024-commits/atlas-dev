import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configuredApiKey: string | null = null;
let mapsLibraryPromise: Promise<google.maps.MapsLibrary> | null = null;
const authFailureListeners = new Set<() => void>();
let authFailureHandlerInstalled = false;
let hasGoogleMapsAuthFailure = false;

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function resetGoogleMapsLoader(): void {
  configuredApiKey = null;
  mapsLibraryPromise = null;
  hasGoogleMapsAuthFailure = false;
}

export function loadGoogleMaps(apiKey: string): Promise<google.maps.MapsLibrary> {
  const trimmedApiKey = apiKey.trim();
  if (!trimmedApiKey) {
    return Promise.reject(new Error('Google Maps API key is missing.'));
  }

  if (mapsLibraryPromise) {
    if (configuredApiKey !== trimmedApiKey) {
      return Promise.reject(new Error('Google Maps has already been configured with a different API key.'));
    }
    return mapsLibraryPromise;
  }

  configuredApiKey = trimmedApiKey;
  setOptions({ key: trimmedApiKey, v: 'weekly' });
  mapsLibraryPromise = importLibrary('maps');

  return mapsLibraryPromise.catch((error) => {
    mapsLibraryPromise = null;
    configuredApiKey = null;
    throw error;
  });
}

export function subscribeToGoogleMapsAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);

  if (typeof window === 'undefined') {
    return () => authFailureListeners.delete(listener);
  }

  const previousGmAuthFailure = window.gm_authFailure;

  if (!authFailureHandlerInstalled) {
    window.gm_authFailure = () => {
      hasGoogleMapsAuthFailure = true;
      previousGmAuthFailure?.();
      authFailureListeners.forEach((authFailureListener) => authFailureListener());
    };
    authFailureHandlerInstalled = true;
  }

  if (hasGoogleMapsAuthFailure) listener();

  return () => {
    authFailureListeners.delete(listener);
    if (authFailureListeners.size === 0 && authFailureHandlerInstalled) {
      window.gm_authFailure = previousGmAuthFailure;
      authFailureHandlerInstalled = false;
    }
  };
}
