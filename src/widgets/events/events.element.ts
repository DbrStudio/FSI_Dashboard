import template from './events.template.html?raw';
import './events.css';

type Event = {
  room: string;
  title: string;
  date: string;
  time: string;
};

type ApiEvent = {
  Id: string;
  Datum: string;
  Name: string;
  Ort: string;
};

type EventsResponse = ApiEvent[];

class EventsCard extends HTMLElement {
  private refreshTimer?: number;

  disconnectedCallback(): void {
    if (this.refreshTimer) window.clearInterval(this.refreshTimer);
  }

  async connectedCallback(): Promise<void> {
    this.innerHTML = template;

    const list = this.querySelector('.events-list') as HTMLElement | null;
    const error = this.querySelector('.events-error') as HTMLElement | null;
    if (!list || !error) return;

    const endpoint = this.getAttribute('endpoint') ?? '/api/events';

    const render = (events: Event[]): void => {
      error.classList.add('hidden');

      list.innerHTML = '';

      for (const event of events.slice(0, 5)) {
        const item = document.createElement('div');
        item.className = 'event-item';

        const row = document.createElement('div');
        row.className = 'event-row';

        const roomEl = document.createElement('div');
        roomEl.className = 'event-room';
        roomEl.textContent = event.room;

        const titleEl = document.createElement('div');
        titleEl.className = 'event-title';
        titleEl.textContent = event.title;
        titleEl.title = event.title;

        const dateTimeEl = document.createElement('div');
        dateTimeEl.className = 'event-datetime';
        dateTimeEl.textContent = `${this.formatDate(event.date)} \u00A0\u00A0\u00A0\u00A0   ${event.time}`;

        row.append(roomEl, titleEl, dateTimeEl);
        item.appendChild(row);
        list.appendChild(item);
      }
    };

    const load = async (): Promise<void> => {
      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EventsResponse;

        if (!Array.isArray(data)) throw new Error('Bad payload');

        // Transform API data to internal format
        const events: Event[] = data.map((apiEvent) => {
          const [date, time] = this.parseDatum(apiEvent.Datum);
          return {
            room: apiEvent.Ort,
            title: apiEvent.Name,
            date: date,
            time: time,
          };
        });

        render(events);
      } catch (e) {
        error.classList.remove('hidden');
        console.warn('EventsCard failed:', e);
      }
    };

    await load();
    this.refreshTimer = window.setInterval(load, 5 * 60 * 1000); // Refresh every 5 minutes
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }

  private parseDatum(datum: string): [string, string] {
    // Assume datum is in ISO format like "2024-05-20T09:00:00" or similar
    const dateTime = new Date(datum);
    const date = dateTime.toISOString().split('T')[0]; // Get YYYY-MM-DD part
    const time = dateTime.toTimeString().split(' ')[0].substring(0, 5); // Get HH:MM part
    return [date, time];
  }
}

customElements.define('events-card', EventsCard);
