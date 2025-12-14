import template from './clock.template.html?raw';
import './clock.css';

class ClockCard extends HTMLElement {
  private timer: number | undefined;

  connectedCallback(): void {
    this.innerHTML = template;

    const timeEl = this.querySelector('.time') as HTMLDivElement | null;
    if (!timeEl) return;

    const tick = () => {
      timeEl.textContent = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };
    tick();
    this.timer = window.setInterval(tick, 1000);
  }
  disconnectedCallback(): void {
    if (this.timer) window.clearInterval(this.timer);
  }
}

customElements.define('clock-card', ClockCard);
