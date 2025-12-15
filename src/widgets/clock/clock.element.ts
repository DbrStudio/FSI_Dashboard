import template from './clock.template.html?raw';
import './clock.css';

function two(n: number): string {
  return String(n).padStart(2, '0');
}

class ClockCard extends HTMLElement {
  private timer: number | undefined;

  connectedCallback(): void {
    this.innerHTML = template;

    const timeEl = this.querySelector('.clock-time') as HTMLDivElement | null;
    const dateEl = this.querySelector('.clock-date') as HTMLDivElement | null;
    const subEl = this.querySelector('.clock-sub') as HTMLDivElement | null;

    if (!timeEl || !dateEl || !subEl) return;

    const tick = (): void => {
      const now = new Date();

      timeEl.textContent = `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`;

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
    this.timer = window.setInterval(tick, 250);
  }

  disconnectedCallback(): void {
    if (this.timer) window.clearInterval(this.timer);
  }
}

customElements.define('clock-card', ClockCard);
