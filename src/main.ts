/*
 * Made by Bready
 * */

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';

import { defineAllWidgets } from './core/define-all';
import { layout } from './core/layout';

defineAllWidgets();

for (const [tag, cfg] of Object.entries(layout)) {
  document.querySelectorAll<HTMLElement>(tag).forEach((el) => {
    const colStart = cfg.col + 1; // CSS grid is 1-based
    const rowStart = cfg.row + 1;

    el.style.gridColumn = `${colStart} / span ${cfg.colSpan}`;
    el.style.gridRow = `${rowStart} / span ${cfg.rowSpan}`;
  });
}
