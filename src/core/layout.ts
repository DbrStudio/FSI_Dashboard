export type WidgetLayout = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

export const layout: Record<string, WidgetLayout> = {
  'clock-card': {
    col: 4,
    row: 0,
    colSpan: 2,
    rowSpan: 2,
  },

  'xkcd-card': {
    col: 0,
    row: 0,
    colSpan: 2,
    rowSpan: 4,
  },

  'mensa-card': {
    col: 2,
    row: 0,
    colSpan: 2,
    rowSpan: 6,
  },
};
