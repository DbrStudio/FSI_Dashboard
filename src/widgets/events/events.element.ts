import template from './events.template.html?raw';
import './events.css';

class EventsCard extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = template;
  }
}

customElements.define('events-card', EventsCard);
