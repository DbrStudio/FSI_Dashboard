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
    rowSpan: 5,
  },

  'events-card': {
    col: 6,
    row: 9,
    colSpan: 4,
    rowSpan: 7,
  },

  'mensa-card': {
    col: 3,
    row: 0,
    colSpan: 3,
    rowSpan: 16,
  },

  'xkcd-card': {
    col: 0,
    row: 5,
    colSpan: 3,
    rowSpan: 11,
  },

  'vrt-card': {
    col: 6,
    row: 0,
    colSpan: 4,
    rowSpan: 9,
  },
};
