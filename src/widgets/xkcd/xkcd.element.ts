import template from './xkcd.template.html?raw';
import './xkcd.css';

const TWENTY_MINUTES_MS = 20 * 60 * 1000;

type XkcdResponse = {
  img: string;
  alt: string;
  safe_title: string;
  day: string;
  month: string;
  year: string;
  num?: number;
};
class XkcdCard extends HTMLElement {
  private refreshIntervalId: number | undefined;

  disconnectedCallback(): void {
    this.stopAutoRefresh();
  }

  private stopAutoRefresh(): void {
    if (this.refreshIntervalId !== undefined) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = undefined;
    }
  }

  private startAutoRefresh(img: HTMLImageElement, caption: HTMLElement): void {
    this.stopAutoRefresh();
    this.refreshIntervalId = window.setInterval(() => {
      void this.loadComic(img, caption);
    }, TWENTY_MINUTES_MS);
  }

  private async loadComic(img: HTMLImageElement, caption: HTMLElement): Promise<void> {
    try {
      const latestRes = await fetch('/api/xkcd/latest');
      if (!latestRes.ok) throw new Error(`HTTP ${latestRes.status}`);
      const latest = (await latestRes.json()) as XkcdResponse;
      const latestId = latest.num;
      if (!latestId) throw new Error('Missing latest id');

      const randomId = Math.floor(Math.random() * latestId) + 1;
      const res = await fetch(`/api/xkcd/${randomId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as XkcdResponse;

      img.src = data.img;
      img.alt = data.alt;
      const formattedDate = [data.day, data.month, data.year].every(Boolean)
        ? `${data.day.padStart(2, '0')}.${data.month.padStart(2, '0')}.${data.year}`
        : '';

      caption.textContent = formattedDate
        ? `${data.safe_title} • ${formattedDate}`
        : data.safe_title;
    } catch {
      caption.textContent = 'Could not load XKCD';
    }
  }

  async connectedCallback() {
    this.innerHTML = template;

    const img = this.querySelector('.comic-img') as HTMLImageElement | null;
    const caption = this.querySelector('.comic-caption') as HTMLElement | null;
    if (!img || !caption) return;

    await this.loadComic(img, caption);
    this.startAutoRefresh(img, caption);
  }
}

customElements.define('xkcd-card', XkcdCard);
