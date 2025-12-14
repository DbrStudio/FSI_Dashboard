import template from './mensa.template.html?raw';
import './mensa.css';

type FilterType =
  | 'VEGAN'
  | 'VEGGIE'
  | 'GLUTEN'
  | 'LAKTOSE'
  | 'ALKOHOL'
  | 'GEFLUEGEL'
  | 'FISCH'
  | 'STUDYFIT'
  | 'KLIMATELLER'
  | 'UNKNOWN';

type Dish = {
  id: string;
  label: string;
  title: string;
  title_intern: string;
  price_guest: number;
  price_student: number;
  price_employee: number;
  filters?: FilterType[];
  filter_list?: string[];
};

const FILTER_META: Record<FilterType, { icon: string; label: string }> = {
  VEGAN: { icon: '🌱', label: 'Vegan' },
  VEGGIE: { icon: '🥕', label: 'Veggie' },
  GLUTEN: { icon: '🚫🌾', label: 'Glutenfrei' },
  LAKTOSE: { icon: '🚫🥛', label: 'Laktosefrei' },
  ALKOHOL: { icon: '🚫🍷', label: 'Alkoholfrei' },
  GEFLUEGEL: { icon: '🍗', label: 'Geflügel' },
  FISCH: { icon: '🐟', label: 'Fisch' },
  STUDYFIT: { icon: '💪', label: 'StudyFit' },
  KLIMATELLER: { icon: '🜨', label: 'Klimateller' },
  UNKNOWN: { icon: '❔', label: 'Unbekannt' },
};

function normalizeFilter(filter: string): FilterType {
  const upper = filter.toUpperCase();
  if (upper in FILTER_META) return upper as FilterType;
  return 'UNKNOWN';
}

function createFilterChips(filters: unknown): HTMLElement | null {
  if (!Array.isArray(filters) || filters.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'mensa-filters';

  const seen = new Set<FilterType>();

  for (const filter of filters) {
    if (typeof filter !== 'string') continue;
    const normalized = normalizeFilter(filter);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const { icon, label } = FILTER_META[normalized];

    const chip = document.createElement('span');
    chip.className = `mensa-chip mensa-chip-${normalized.toLowerCase()}`;
    chip.title = label;

    const iconEl = document.createElement('span');
    iconEl.className = 'mensa-chip-icon';
    iconEl.textContent = icon;
    iconEl.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'mensa-chip-label';
    text.textContent = label;

    chip.append(iconEl, text);
    container.appendChild(chip);
  }

  return container.childElementCount ? container : null;
}

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

function createPriceBadges(dish: Dish): HTMLElement {
  const container = document.createElement('div');
  container.className = 'mensa-prices';

  const prices = [
    { label: 'Mitarbeitende', emoji: '👩‍💼', value: dish.price_employee },
    { label: 'Studierende', emoji: '🎓', value: dish.price_student },
    { label: 'Gäste', emoji: '👥', value: dish.price_guest },
  ];

  for (const { label, emoji, value } of prices) {
    const badge = document.createElement('div');
    badge.className = 'mensa-price';
    badge.title = label;

    const emojiEl = document.createElement('span');
    emojiEl.className = 'mensa-price-emoji';
    emojiEl.textContent = emoji;
    emojiEl.setAttribute('aria-hidden', 'true');

    const valueEl = document.createElement('span');
    valueEl.className = 'mensa-price-value';
    valueEl.textContent = formatEuro(value);

    const labelEl = document.createElement('span');
    labelEl.className = 'mensa-price-label';
    labelEl.textContent = label;

    badge.append(emojiEl, valueEl, labelEl);
    container.appendChild(badge);
  }

  return container;
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

        const header = document.createElement('div');
        header.className = 'mensa-item-header';

        const label = document.createElement('div');
        label.className = 'mensa-label';
        label.textContent = dish.label;

        const priceBadges = createPriceBadges(dish);

        header.appendChild(label);
        header.appendChild(priceBadges);

        const title = document.createElement('div');
        title.className = 'mensa-title';
        title.textContent = dish.title;
        title.title = dish.title_intern;

        const filters = createFilterChips(dish.filters ?? dish.filter_list);

        li.appendChild(header);
        li.appendChild(title);
        if (filters) li.appendChild(filters);

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
