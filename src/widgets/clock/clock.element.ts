import template from './clock.template.html?raw';
import './clock.css';

function weatherIcon(desc?: string): string {
  if (!desc) return '󰋙'; // unknown

  const d = desc.toLowerCase();

  if (d.includes('clear') || d.includes('klar')) return '󰖙';
  if (d.includes('cloud') || d.includes('wolken') || d.includes('bedeckt')) return '󰖐';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('regen') || d.includes('schauer'))
    return '󰖗';
  if (d.includes('thunder') || d.includes('gewitter')) return '󰙾';
  if (d.includes('snow') || d.includes('schnee')) return '󰖘';
  if (d.includes('fog') || d.includes('mist') || d.includes('haze') || d.includes('nebel') || d.includes('dunst'))
    return '󰖑';

  return '󰋙';
}

function two(n: number): string {
  return String(n).padStart(2, '0');
}

class ClockCard extends HTMLElement {
  private timer: number | undefined;
  private weatherTimer: number | undefined;

  connectedCallback(): void {
    this.innerHTML = template;

    const mainTimeEl = this.querySelector('.clock-main') as HTMLSpanElement | null;
    const secondsEl = this.querySelector('.clock-seconds') as HTMLSpanElement | null;
    const dateEl = this.querySelector('.clock-date') as HTMLDivElement | null;
    const tempEl = this.querySelector('.weather-temp') as HTMLSpanElement | null;
    const descEl = this.querySelector('.weather-desc') as HTMLSpanElement | null;
    const locationEl = this.querySelector('.weather-location') as HTMLSpanElement | null;
    const updatedEl = this.querySelector('.weather-updated') as HTMLSpanElement | null;

    if (!dateEl || !tempEl || !descEl || !locationEl || !updatedEl || !mainTimeEl || !secondsEl) return;

    const tick = (): void => {
      const now = new Date();

      mainTimeEl.textContent = `${two(now.getHours())}:${two(now.getMinutes())}`;
      secondsEl.textContent = `:${two(now.getSeconds())}`;

      dateEl.textContent = now.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      //subEl.textContent = `:${two(now.getSeconds())} · ${now.getFullYear()}`;
    };

    tick();
    if (this.timer) window.clearInterval(this.timer);
    this.timer = window.setInterval(tick, 1000);

    const fetchWeather = async (): Promise<void> => {
      const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined;
      const location = this.getAttribute('data-location') ?? 'Trier, DE';
      const units = this.getAttribute('data-units') ?? 'metric';

      locationEl.textContent = location;

      if (!apiKey) {
        descEl.textContent = 'Set VITE_OPENWEATHERMAP_API_KEY';
        updatedEl.textContent = '';
        return;
      }

      try {
        const url = new URL('https://api.openweathermap.org/data/2.5/weather');
        url.searchParams.set('q', location);
        url.searchParams.set('units', units);
        url.searchParams.set('appid', apiKey);
        url.searchParams.set('lang', 'de');

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather error: ${res.status}`);

        const data = (await res.json()) as {
          main?: { temp?: number };
          weather?: Array<{ description?: string }>;
        };

        const temp = data.main?.temp;
        const desc = data.weather?.[0]?.description;
        const icon = weatherIcon(desc);

        tempEl.textContent =
          typeof temp === 'number'
            ? `${Math.round(temp)}°${units === 'metric' ? 'C' : 'F'}`
            : '--°';

        descEl.textContent = desc ? `${icon} ${desc}` : 'Wetter nicht verfügbar';
        updatedEl.textContent = `Aktualisiert ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } catch (error) {
        descEl.textContent = 'Wetter nicht verfügbar';
        updatedEl.textContent = '';
        console.error(error);
      }
    };

    fetchWeather();
    if (this.weatherTimer) window.clearInterval(this.weatherTimer);
    this.weatherTimer = window.setInterval(fetchWeather, 10 * 60 * 1000);
  }

  disconnectedCallback(): void {
    if (this.timer) window.clearInterval(this.timer);
    if (this.weatherTimer) window.clearInterval(this.weatherTimer);
  }
}

customElements.define('clock-card', ClockCard);
