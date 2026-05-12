// Fetch real-time weather via Open-Meteo (no API key required) + browser geolocation.
// Cached in localStorage for 15 minutes per location.
import React from 'react';

const CACHE_KEY = 'archive_weather_cache';
const TTL_MS = 15 * 60 * 1000;
const DEFAULT = { temp: 61, condition: 'Clear', code: 0 };

// WMO weather codes → short label + icon type
function decodeWeather(code) {
  if (code === 0) return { condition: 'Clear', icon: 'sun' };
  if (code === 1) return { condition: 'Sunny', icon: 'sun' };
  if (code === 2) return { condition: 'Partly cloudy', icon: 'partly' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Fog', icon: 'cloud' };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', icon: 'rain' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', icon: 'rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'snow' };
  if (code >= 80 && code <= 82) return { condition: 'Showers', icon: 'rain' };
  if (code === 85 || code === 86) return { condition: 'Snow', icon: 'snow' };
  if (code >= 95 && code <= 99) return { condition: 'Storm', icon: 'storm' };
  return { condition: 'Clear', icon: 'sun' };
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > TTL_MS) return null;
    return obj;
  } catch (e) { return null; }
}
function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() })); } catch (e) {}
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('no-geo'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 6000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch-failed');
  const data = await r.json();
  const cw = data.current_weather;
  if (!cw) throw new Error('no-current');
  const decoded = decodeWeather(cw.weathercode);
  return {
    temp: Math.round(cw.temperature),
    condition: decoded.condition,
    icon: decoded.icon,
    code: cw.weathercode,
  };
}

export function useWeather() {
  const [state, setState] = React.useState(() => {
    const cached = readCache();
    if (cached) return { ...cached, loading: false };
    return { ...DEFAULT, icon: 'sun', loading: true };
  });

  React.useEffect(() => {
    const cached = readCache();
    if (cached) return; // fresh enough — skip
    let cancelled = false;
    (async () => {
      try {
        const { lat, lon } = await getPosition();
        const w = await fetchWeather(lat, lon);
        if (cancelled) return;
        writeCache(w);
        setState({ ...w, loading: false });
      } catch (e) {
        if (cancelled) return;
        setState({ ...DEFAULT, icon: 'sun', loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export function WeatherIcon({ type = 'sun', size = 22, color = '#F5F0E8' }) {
  const sw = 1.6;
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'sun') return (
    <svg {...common}>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
  if (type === 'partly') return (
    <svg {...common}>
      <circle cx="8" cy="9" r="3"/>
      <path d="M8 2v1M3 9H2M13.5 4.5l-.7.7M3.5 4.5l.7.7"/>
      <path d="M14 19a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.5A3.5 3.5 0 0 0 5 19h9z"/>
    </svg>
  );
  if (type === 'cloud') return (
    <svg {...common}>
      <path d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 18h11z"/>
    </svg>
  );
  if (type === 'rain') return (
    <svg {...common}>
      <path d="M17 13a4 4 0 0 0 0-8 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 13h11z"/>
      <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>
    </svg>
  );
  if (type === 'snow') return (
    <svg {...common}>
      <path d="M17 13a4 4 0 0 0 0-8 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 13h11z"/>
      <path d="M8 18v3M12 17v4M16 18v3M7 19.5h2M11 19.5h2M15 19.5h2"/>
    </svg>
  );
  if (type === 'storm') return (
    <svg {...common}>
      <path d="M17 13a4 4 0 0 0 0-8 6 6 0 0 0-11.6 2A3.5 3.5 0 0 0 6 13h11z"/>
      <path d="M11 15l-2 4h3l-2 4"/>
    </svg>
  );
  return null;
}
