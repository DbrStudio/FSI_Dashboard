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
    console.log('EventsCard: Using endpoint:', endpoint);

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
        console.log('EventsCard: Fetching from endpoint:', endpoint);
        const res = await fetch(endpoint, { cache: 'no-store' });
        console.log('EventsCard: Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EventsResponse;
        console.log('EventsCard: Received data:', data);

        if (!Array.isArray(data)) throw new Error('Bad payload');

        // Transform API data to internal format
        const events: Event[] = data.map((apiEvent) => {
          console.log('EventsCard: Processing event:', apiEvent);
          const [date, time] = this.parseDatum(apiEvent.Datum);
          return {
            room: apiEvent.Ort,
            title: apiEvent.Name,
            date: date,
            time: time,
          };
        });

        console.log('EventsCard: Transformed events:', events);
        render(events);
      } catch (e) {
        console.error('EventsCard: Error loading events:', e);
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
    try {
      // Try to parse as ISO string first
      let dateTime = new Date(datum);

      // If that doesn't work, try other common formats
      if (isNaN(dateTime.getTime())) {
        // Try format like "2024-05-20 09:00:00"
        const spaceSeparated = datum.replace('T', ' ');
        dateTime = new Date(spaceSeparated);

        // If still not working, try to parse manually
        if (isNaN(dateTime.getTime())) {
          console.warn('EventsCard: Could not parse date:', datum);
          // Return fallback values
          return ['2024-01-01', '00:00'];
        }
      }

      const date = dateTime.toISOString().split('T')[0]; // Get YYYY-MM-DD part
      const time = dateTime.toTimeString().split(' ')[0].substring(0, 5); // Get HH:MM part
      return [date, time];
    } catch (error) {
      console.error('EventsCard: Error parsing datum:', datum, error);
      return ['2024-01-01', '00:00'];
    }
  }
}

customElements.define('events-card', EventsCard);
