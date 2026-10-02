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

export function loadGoogleMaps(apiKey: string): Promise<google.maps.MapsLibrary> {
  if (mapsLibraryPromise) {
    if (configuredApiKey !== apiKey) {
      return Promise.reject(new Error('Google Maps has already been configured with a different API key.'));
    }
    return mapsLibraryPromise;
  }

  configuredApiKey = apiKey;
  setOptions({ key: apiKey, v: 'weekly' });
  mapsLibraryPromise = importLibrary('maps');
  return mapsLibraryPromise;
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

  return () => authFailureListeners.delete(listener);
}
