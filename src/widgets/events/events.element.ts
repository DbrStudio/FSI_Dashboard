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

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  async connectedCallback(): Promise<void> {
    this.innerHTML = template;

    const meta = this.querySelector('.events-meta') as HTMLElement | null;
    const list = this.querySelector('.events-list') as HTMLElement | null;
    const error = this.querySelector('.events-error') as HTMLElement | null;
    if (!list || !error || !meta) return;

    const currentWeek = this.getWeekNumber(new Date());
    meta.textContent = `KW ${currentWeek}`;

    const endpoint = this.getAttribute('endpoint') ?? '/api/calender/events';
    console.log('EventsCard: Using endpoint:', endpoint);

    const render = (events: Event[]): void => {
      console.log('EventsCard: Rendering events:', events);
      error.classList.add('hidden');

      if (events.length === 0) {
        console.log('EventsCard: No events to display');
        list.innerHTML = '';
        const noEventsEl = document.createElement('div');
        noEventsEl.textContent = 'No upcoming events';
        noEventsEl.style.padding = '1rem';
        noEventsEl.style.textAlign = 'center';
        noEventsEl.style.color = 'var(--color-text-muted)';
        list.appendChild(noEventsEl);
        return;
      }

      list.innerHTML = '';

      for (const event of events.slice(0, 5)) {
        console.log('EventsCard: Rendering event:', event);
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
      console.log('EventsCard: Finished rendering', events.length, 'events');
    };

    const load = async (): Promise<void> => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
      try {
        console.log('EventsCard: Fetching from endpoint:', endpoint);
        const res = await fetch(endpoint, { cache: 'no-store', signal: controller.signal });
        console.log('EventsCard: Response status:', res.status, 'headers:', Object.fromEntries(res.headers.entries()));

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const rawText = await res.text();
        console.log('EventsCard: Raw response text:', rawText);

        const data = JSON.parse(rawText) as EventsResponse;
        console.log('EventsCard: Parsed data:', data);

        if (!Array.isArray(data)) {
          console.error('EventsCard: Data is not an array:', data);
          throw new Error('Bad payload');
        }

        // Transform API data to internal format
        const events: Event[] = data.map((apiEvent, index) => {
          console.log(`EventsCard: Processing event ${index}:`, apiEvent);
          const [date, time] = this.parseDatum(apiEvent.Datum);
          const event = {
            room: apiEvent.Ort || 'No location',
            title: apiEvent.Name || 'Untitled Event',
            date: date,
            time: time,
          };
          console.log(`EventsCard: Transformed event ${index}:`, event);
          return event;
        });

        console.log('EventsCard: All transformed events:', events);
        render(events);
      } catch (e) {
        console.error('EventsCard: Error loading events:', e);
        error.classList.remove('hidden');
        console.warn('EventsCard failed:', e);
      } finally {
        window.clearTimeout(timeoutId);
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
      console.log('EventsCard: Parsing datum:', datum);

      // Handle German format: "DD.MM.YYYY HH:MM"
      const germanDateRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/;
      const match = datum.match(germanDateRegex);

      if (match) {
        const [, day, month, year, hour, minute] = match;
        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const timeString = `${hour}:${minute}`;
        console.log('EventsCard: Parsed German date:', dateString, timeString);
        return [dateString, timeString];
      }

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
