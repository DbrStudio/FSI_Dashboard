import template from './xkcd.template.html?raw';
import './xkcd.css';

type XkcdResponse = {
  img: string;
  alt: string;
  safe_title: string;
  day: string;
  month: string;
  year: string;
};
class XkcdCard extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = template;

    const img = this.querySelector('.comic-img') as HTMLImageElement | null;
    const caption = this.querySelector('.comic-caption') as HTMLElement | null;
    if (!img || !caption) return;

    try {
      const res = await fetch('/api/xkcd/latest');
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
}

customElements.define('xkcd-card', XkcdCard);
