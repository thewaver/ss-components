import { point } from './point-utils';

export const OriginFunc = {
  Center: (count) => {
    return point((count.x - 1) / 2, (count.y - 1) / 2);
  },

  Top: (count) => {
    return point((count.x - 1) / 2, 0);
  },

  TopRight: (count) => {
    return point(count.x - 1, 0);
  },

  Right: (count) => {
    return point(count.x - 1, (count.y - 1) / 2);
  },

  BottomRight: (count) => {
    return point(count.x - 1, count.y - 1);
  },

  Bottom: (count) => {
    return point((count.x - 1) / 2, count.y - 1);
  },

  BottomLeft: (count) => {
    return point(0, count.y - 1);
  },

  Left: (count) => {
    return point(0, (count.y - 1) / 2);
  },

  TopLeft: (count) => {
    return point(0, 0);
  }
}
