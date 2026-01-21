import template from './vrt.template.html?raw';
import './vrt.css';

type VrtDeparture = {
  line: string;
  direction: string;
  platform: string;
  planTime: string;
  delay: string; // "+ 8" | "+ 0" | ""
  isLate: boolean;
  countdown: string; // "in 3 Min."
};

type VrtDmResponse = {
  stopId: number;
  stopName: string;
  time: string;
  departures: VrtDeparture[];
};

class VrtDmCard extends HTMLElement {
  private refreshTimer?: number;

  disconnectedCallback(): void {
    if (this.refreshTimer) window.clearInterval(this.refreshTimer);
  }

  async connectedCallback(): Promise<void> {
    this.innerHTML = template;

    const meta = this.querySelector('.vrt-meta') as HTMLElement | null;
    const stop = this.querySelector('.vrt-stop') as HTMLElement | null;
    const list = this.querySelector('.vrt-list') as HTMLUListElement | null;
    const error = this.querySelector('.vrt-error') as HTMLElement | null;
    if (!meta || !stop || !list || !error) return;

    const stopId = this.getAttribute('stop-id') ?? '17003106';
    const endpoint = this.getAttribute('endpoint') ?? `/api/vrt/dm/${stopId}`;

    const render = (data: VrtDmResponse): void => {
      error.classList.add('hidden');

      stop.textContent = data.stopName || 'VRT Abfahrten';
      meta.textContent = data.time ? `Live · ${data.time}` : 'Live';

      list.innerHTML = '';

      for (const d of (data.departures ?? []).slice(0, 12)) {
        const li = document.createElement('li');
        li.className = 'vrt-item';

        const row = document.createElement('div');
        row.className = 'vrt-row';

        const lineEl = document.createElement('div');
        lineEl.className = 'vrt-line';
        lineEl.textContent = d.line;

        const dirEl = document.createElement('div');
        dirEl.className = 'vrt-direction';
        dirEl.textContent = d.direction;
        dirEl.title = d.direction;

        const platformEl = document.createElement('div');
        platformEl.textContent = d.platform;

        const planEl = document.createElement('div');
        planEl.className = 'vrt-plan';
        planEl.textContent = d.planTime;

        if (d.delay) {
          const delayEl = document.createElement('span');
          delayEl.className = `vrt-delay${d.isLate ? ' late' : ''}`;
          delayEl.textContent = d.delay;
          planEl.appendChild(delayEl);
        }

        const depEl = document.createElement('div');
        depEl.className = 'vrt-dep';
        depEl.textContent = d.countdown;

        row.append(lineEl, dirEl, platformEl, planEl, depEl);
        li.appendChild(row);
        list.appendChild(li);
      }
    };

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VrtDmResponse;

        if (!data || !Array.isArray(data.departures)) throw new Error('Bad payload');
        render(data);
      } catch (e) {
        error.classList.remove('hidden');
        meta.textContent = `Error · ${stopId}`;
        console.warn('VrtDmCard failed:', e);
      }
    };

    await load();
    this.refreshTimer = window.setInterval(load, 12_000);
  }
}

customElements.define('vrt-card', VrtDmCard);

