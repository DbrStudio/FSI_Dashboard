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
    rowSpan: 2,
  },

  'xkcd-card': {
    col: 0,
    row: 2,
    colSpan: 3,
    rowSpan: 4,
  },

  'mensa-card': {
    col: 3,
    row: 2,
    colSpan: 3,
    rowSpan: 4,
  },

  'vrt-card': {
    col: 6,
    row: 0,
    colSpan: 4,
    rowSpan: 6,
  },
};
