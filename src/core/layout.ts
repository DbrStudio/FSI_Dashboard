export type WidgetLayout = {
  colSpan: number;
  rowSpan: number;
  col?: number;
  row?: number;
};

export const layout: Record<string, WidgetLayout> = {
  'clock-card': {
    colSpan: 1,
    rowSpan: 2,
    col: 6,
    row: 0,
  },

  'xkcd-card': {
    colSpan: 3,
    rowSpan: 3,
  },

  'mensa-card': {
    colSpan: 3,
    rowSpan: 3,
  },
};
