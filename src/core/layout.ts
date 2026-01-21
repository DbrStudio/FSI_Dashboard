export type WidgetLayout = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

export const layout: Record<string, WidgetLayout> = {
  'clock-card': {
    col: 0,
    row: 0,
    colSpan: 3,
    rowSpan: 3,
  },

  'events-card': {
    col: 6,
    row: 6,
    colSpan: 4,
    rowSpan: 4,
  },

  'mensa-card': {
    col: 3,
    row: 0,
    colSpan: 3,
    rowSpan: 10,
  },

  'xkcd-card': {
    col: 0,
    row: 3,
    colSpan: 3,
    rowSpan: 7,
  },

  'vrt-card': {
    col: 6,
    row: 0,
    colSpan: 4,
    rowSpan: 6,
  },
};
