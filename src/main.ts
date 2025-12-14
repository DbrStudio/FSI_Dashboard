import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';

import { defineAllWidgets } from './core/define-all';
import { layout } from './core/layout';

defineAllWidgets();

for (const [tag, cfg] of Object.entries(layout)) {
  document.querySelectorAll<HTMLElement>(tag).forEach((el) => {
    el.style.setProperty('--grid-col-span', String(cfg.colSpan));
    el.style.setProperty('--grid-row-span', String(cfg.rowSpan));

    if (cfg.col !== undefined) {
      el.style.setProperty('--grid-col', String(cfg.col));
    }
    if (cfg.row !== undefined) {
      el.style.setProperty('--grid-row', String(cfg.row));
    }
  });
}
