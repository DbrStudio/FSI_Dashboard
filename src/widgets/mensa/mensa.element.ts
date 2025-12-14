import template from './mensa.template.html?raw';
import './mensa.css';

type Dish = {
  id: string;
  label: string;
  title: string;
  title_intern: string;
  price_guest: number;
  price_student: number;
  price_employee: number;
};

function yyyymmdd(date: Date): string {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

class MensaCard extends HTMLElement {
  async connectedCallback(): Promise<void> {
    this.innerHTML = template;

    const meta = this.querySelector('.mensa-meta') as HTMLElement | null;
    const list = this.querySelector('.mensa-list') as HTMLUListElement | null;
    const error = this.querySelector('.mensa-error') as HTMLElement | null;
    if (!meta || !list || !error) return;

    const date = new Date();
    const dateParam = yyyymmdd(date);

    // Standort 4 fixed for now (you can make it configurable later via layout registry if you want)
    const url = `/api/mensa/get_dishes?date=${dateParam}&standort=4`;

    meta.textContent = `${date.toLocaleDateString('de-DE')} · Studierende`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const dishes = (await res.json()) as Dish[];
      if (!Array.isArray(dishes) || dishes.length === 0) throw new Error('No dishes');

      list.innerHTML = '';

      for (const dish of dishes) {
        const li = document.createElement('li');
        li.className = 'mensa-item';

        const label = document.createElement('div');
        label.className = 'mensa-label';
        label.textContent = dish.label;

        const title = document.createElement('div');
        title.className = 'mensa-title';
        title.textContent = dish.title;

        const price = document.createElement('div');
        price.className = 'mensa-price';
        price.textContent = formatEuro(dish.price_student);

        li.appendChild(label);
        li.appendChild(title);
        li.appendChild(price);
        list.appendChild(li);
      }
    } catch (e) {
      error.classList.remove('hidden');
      // Optional: meta hint so you immediately see the dateParam when debugging
      meta.textContent = `Error · ${dateParam}`;
      console.warn('MensaCard failed:', e);
    }
  }
}

customElements.define('mensa-card', MensaCard);
