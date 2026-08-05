import { WeightedArray } from './weighted-array';
import { getDistFromPoint } from './point-utils';

export const ZoneFunc = {
  All: () => {
    return true;
  },

  Top: (pos, origin) => {
    return (pos.y < origin.y);
  },

  Left: (pos, origin) => {
    return (pos.x < origin.x);
  },

  Bottom: (pos, origin) => {
    return (pos.y > origin.y);
  },

  Right: (pos, origin) => {
    return (pos.x > origin.x);
  },

  Quadrant1: (pos, origin) => {
    return ((pos.x > origin.x) && (pos.y < origin.y));
  },

  Quadrant2: (pos, origin) => {
    return ((pos.x < origin.x) && (pos.y < origin.y));
  },

  Quadrant3: (pos, origin) => {
    return ((pos.x < origin.x) && (pos.y > origin.y));
  },

  Quadrant4: (pos, origin) => {
    return ((pos.x > origin.x) && (pos.y > origin.y));
  },

  AxisX: (pos, origin) => {
    return (pos.y === origin.y);
  },

  AxisY: (pos, origin) => {
    return (pos.x === origin.x);
  },

  Axis1: (pos, origin) => {
    return ((pos.x === origin.x) && (pos.y < origin.y));
  },

  Axis2: (pos, origin) => {
    return ((pos.x < origin.x) && (pos.y === origin.y));
  },

  Axis3: (pos, origin) => {
    return ((pos.x > origin.x) && (pos.y === origin.y));
  },

  Axis4: (pos, origin) => {
    return ((pos.x === origin.x) && (pos.y > origin.y));
  },

  Origin: (pos, origin) => {
    return ((pos.x === origin.x) && (pos.y === origin.y));
  },

  EvenRows: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return WeightedArray.isEvenRowPoint(distFromOrigin);
  },

  OddRows: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return !WeightedArray.isEvenRowPoint(distFromOrigin);
  },

  EvenColumns: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return WeightedArray.isEvenColumnPoint(distFromOrigin);
  },

  OddColumns: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return !WeightedArray.isEvenColumnPoint(distFromOrigin);
  },

  EvenRings: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return WeightedArray.isEvenRingPoint(distFromOrigin);
  },

  OddRings: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return !WeightedArray.isEvenRingPoint(distFromOrigin);
  },

  EvenCheckeredCells: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return WeightedArray.isEvenCheckeredPoint(distFromOrigin);
  },

  OddCheckeredCells: (pos, origin) => {
    const distFromOrigin = getDistFromPoint(origin, pos);

    return !WeightedArray.isEvenCheckeredPoint(distFromOrigin);
  },

  LighterHalf: (pos, origin, count, weight) => {
    return weight < .5;
  },

  HeavierHalf: (pos, origin, count, weight) => {
    return weight >= .5;
  }
}