import { useState, useEffect } from 'react';

const SCRIPT_ID = 'google-maps-places-api';
let sharedPromise = null;

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.google?.maps?.places
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!apiKey || loaded || failed) return;

    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    if (!sharedPromise) {
      sharedPromise = new Promise((resolve, reject) => {
        if (document.getElementById(SCRIPT_ID)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    sharedPromise
      .then(() => setLoaded(true))
      .catch(() => {
        sharedPromise = null;
        setFailed(true);
      });
  }, [apiKey, loaded, failed]);

  return { loaded, failed, hasKey: !!apiKey };
}
