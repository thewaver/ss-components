import { WeightedArray } from './weighted-array';
import { point, getDistFromPoint, getMaxDist } from './point-utils';

const radar = (pos, count, origin, quadrantsPerSection, cdoMul, croMul, cuoMul, cloMul) => {
  if (pos.x === origin.x && pos.y === origin.y) {
    return 1;
  }

  const maxDist = getMaxDist(origin, count);
  const distFromOrigin = getDistFromPoint(origin, pos);
  const maxWeight = Math.max(maxDist.x, maxDist.y) * 2 * quadrantsPerSection;
  const cellsInRing = Math.max(distFromOrigin.x, distFromOrigin.y) * 2;
  const sectionMaxWeight = (maxWeight / quadrantsPerSection);
  const increment = sectionMaxWeight / cellsInRing;
  const cdo = sectionMaxWeight * cdoMul;
  const cro = sectionMaxWeight * croMul;
  const cuo = sectionMaxWeight * cuoMul;
  const clo = sectionMaxWeight * cloMul;
  
  let result = 0;

  if (distFromOrigin.x === 0) {
    result = (pos.y < origin.y) ? cuo : cdo;
  } else if (distFromOrigin.y === 0) {
    result = (pos.x < origin.x) ? clo : cro;
  } else if (pos.x > origin.x) {
    if (pos.y > origin.y) {
      result = cdo + (distFromOrigin.x + Math.max(distFromOrigin.x - distFromOrigin.y, 0)) * increment;
    } else if (pos.y < origin.y) {
      result = cro + (distFromOrigin.y + Math.max(distFromOrigin.y - distFromOrigin.x, 0)) * increment;
    }
  } else if (pos.x < origin.x) {
    if (pos.y < origin.y) {
      result = cuo + (distFromOrigin.x + Math.max(distFromOrigin.x - distFromOrigin.y, 0)) * increment;;
    } else if (pos.y > origin.y) {
      result = clo + (distFromOrigin.y + Math.max(distFromOrigin.y - distFromOrigin.x, 0)) * increment;
    }
  }

  return 1 - (result / (maxWeight - 1));
}

const spiral = (pos, count, origin, quadrantsPerSection, cdoMul, croMul, cuoMul, cloMul) => {
  if (pos.x === origin.x && pos.y === origin.y) {
    return 1;
  }

  const maxDist = getMaxDist(origin, count);
  const distFromOrigin = getDistFromPoint(origin, pos);
  const sectionDivider = (4 / quadrantsPerSection);
  const maxWeight = (Math.pow(Math.max(maxDist.x, maxDist.y) * 2 + 1, 2) - 1) / sectionDivider;
  const cdo = Math.pow(distFromOrigin.y * 2 - 1, 2) / sectionDivider + distFromOrigin.y * cdoMul + (1 - (1 / sectionDivider));
  const cro = Math.pow(distFromOrigin.x * 2 - 1, 2) / sectionDivider + distFromOrigin.x * croMul + (1 - (1 / sectionDivider));
  const cuo = Math.pow(distFromOrigin.y * 2 - 1, 2) / sectionDivider + distFromOrigin.y * cuoMul + (1 - (1 / sectionDivider));
  const clo = Math.pow(distFromOrigin.x * 2 - 1, 2) / sectionDivider + distFromOrigin.x * cloMul + (1 - (1 / sectionDivider));

  let result = 0;

  if (distFromOrigin.x === 0) {
    result = (pos.y < origin.y) ? cuo : cdo;
  } else if (distFromOrigin.y === 0) {
    result = (pos.x < origin.x) ? clo : cro;
  } else if (pos.x > origin.x) {
    if (pos.y > origin.y) {
      if (distFromOrigin.y < distFromOrigin.x) {
        result = cro - distFromOrigin.y;
      } else {
        result = cdo + distFromOrigin.x;
      }
    } else if (pos.y < origin.y) {
      if (distFromOrigin.x < distFromOrigin.y) {
        result = cuo - distFromOrigin.x;
      } else {
        result = cro + distFromOrigin.y;
      }
    }
  } else if (pos.x < origin.x) {
    if (pos.y < origin.y) {
      if (distFromOrigin.y < distFromOrigin.x) {
        result = clo - distFromOrigin.y;
      } else {
        result = cuo + distFromOrigin.x;
      }
    } else if (pos.y > origin.y) {
      if (distFromOrigin.x < distFromOrigin.y) {
        result = cdo - distFromOrigin.x;
      } else {
        result = clo + distFromOrigin.y; 
      }
    }
  }

  return 1 - ((result - 1) / maxWeight);
}



export const WeightFunc = {
  Line: {
    Row: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);

      return 1 - (distFromOrigin.y / maxDist.y);
    },

    Column: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return 1 - (distFromOrigin.x / maxDist.x);
    },

    RowAlternate: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);

      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? 1 - (distFromOrigin.y / (maxDist.y * 2))
        : 1 - ((distFromOrigin.y / (maxDist.y * 2)) + .5);
    },

    ColumnAlternate: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? 1 - (distFromOrigin.x / (maxDist.x * 2))
        : 1 - ((distFromOrigin.x / (maxDist.x * 2)) + .5);
    },

    RowConvergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);

      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? 1 - (distFromOrigin.y / (maxDist.y * 2))
        : 1 - (((maxDist.y + 1 - distFromOrigin.y) / (maxDist.y * 2)) + .5);
    },

    ColumnConvergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? 1 - (distFromOrigin.x / (maxDist.x * 2))
        : 1 - (((maxDist.x + 1 - distFromOrigin.x) / (maxDist.x * 2)) + .5);
    }
  },

  Zigzag: {
    Row: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? ((1 - (distFromOrigin.x / maxDist.x)) + (maxDist.y - distFromOrigin.y)) / (maxDist.y + 1)
        : ((distFromOrigin.x / maxDist.x) + (maxDist.y - distFromOrigin.y)) / (maxDist.y + 1);
    },

    Column: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? ((1 - (distFromOrigin.y / maxDist.y)) + (maxDist.x - distFromOrigin.x)) / (maxDist.x + 1)
        : ((distFromOrigin.y / maxDist.y) + (maxDist.x - distFromOrigin.x)) / (maxDist.x + 1);
    }
  },

  Roll: {
    Row: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? 1 - (distFromOrigin.x / (maxDist.x * 2))
        : 1 - ((distFromOrigin.x / (maxDist.x * 2)) + .5);
    },

    Column: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);

      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? 1 - (distFromOrigin.y / (maxDist.y * 2))
        : 1 - ((distFromOrigin.y / (maxDist.y * 2)) + .5);
    },

    RowConvergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? 1 - (distFromOrigin.x / (maxDist.x * 2))
        : (distFromOrigin.x / (maxDist.x * 2));
    },

    ColumnConvergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);

      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? 1 - (distFromOrigin.y / (maxDist.y * 2))
        : (distFromOrigin.y / (maxDist.y * 2));
    }
  },

  Entwine: {
    Row: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenRowPoint(distFromOrigin)
        ? 1 - (distFromOrigin.x / maxDist.x)
        : (distFromOrigin.x / maxDist.x);
    },

    Column: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return WeightedArray.isEvenColumnPoint(distFromOrigin)
        ? 1 - (distFromOrigin.y / maxDist.y)
        : (distFromOrigin.y / maxDist.y);
    }
  },

  Oval: {
    Row: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
    
      return ((1 - (distFromOrigin.x / maxDist.x)) + (maxDist.y - distFromOrigin.y)) / (maxDist.y + 1);
    },

    Column: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      
      return ((1 - (distFromOrigin.y / maxDist.y)) + (maxDist.x - distFromOrigin.x)) / (maxDist.x + 1);
    }
  },

  Circular: {
    Default: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y);
      const adjustedDistFromOrigin = (distFromOrigin.x + distFromOrigin.y) / 2;
      
      return (1 - (adjustedDistFromOrigin / adjustedMaxDist));
    },

    Alternate: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = (distFromOrigin.x + distFromOrigin.y) / 2;
      
      return WeightedArray.isEvenRingPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedDistFromOrigin / adjustedMaxDist) + .5));
    },

    Convergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = (distFromOrigin.x + distFromOrigin.y) / 2;
      
      return WeightedArray.isEvenRingPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedMaxDist + .5 - adjustedDistFromOrigin) / adjustedMaxDist));
    }
  },

  Quadratic: {
    Default: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y);
      const adjustedDistFromOrigin = Math.max(distFromOrigin.x, distFromOrigin.y);

      return 1 - (adjustedDistFromOrigin / adjustedMaxDist);
    },

    Alternate: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = Math.max(distFromOrigin.x, distFromOrigin.y);

      return WeightedArray.isEvenRingPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedDistFromOrigin / adjustedMaxDist) + .5));
    },

    Convergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = Math.max(distFromOrigin.x, distFromOrigin.y);

      return WeightedArray.isEvenRingPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedMaxDist + 1 - adjustedDistFromOrigin) / adjustedMaxDist));
    }
  },

  Spiral: {
    Single: (pos, count, origin) => {
      return spiral(pos, count, origin, 4, 1, 3, 5, 7);
    },

    Double: (pos, count, origin) => {
      return spiral(pos, count, origin, 2, 1, 3, 1, 3);
    },

    Quad: (pos, count, origin) => {
      return spiral(pos, count, origin, 1, 1, 1, 1, 1);
    }
  },

  Radar: {
    Single: (pos, count, origin) => {
      return radar(pos, count, origin, 4, 0, 1, 2, 3);
    },

    Double: (pos, count, origin) => {
      return radar(pos, count, origin, 2, 0, 1, 0, 1);
    },

    Quad: (pos, count, origin) => {
      return radar(pos, count, origin, 1, 0, 0, 0, 0);
    }
  },

  Quadrant: {
    Default: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const signedDistFromOrigin = point(origin.x - pos.x, origin.y - pos.y);
      const adjustedMaxDist = maxDist.x * maxDist.y;
      const adjustedSignedDistFromOrigin = signedDistFromOrigin.x * signedDistFromOrigin.y;

      return (1 - (adjustedSignedDistFromOrigin / adjustedMaxDist)) / 2;
    }
  },

  Checkered: {
    Default: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = Math.max(distFromOrigin.x, distFromOrigin.y);
      
      return WeightedArray.isEvenCheckeredPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedDistFromOrigin / adjustedMaxDist) + .5));
    },

    Convergent: (pos, count, origin) => {
      const maxDist = getMaxDist(origin, count);
      const distFromOrigin = getDistFromPoint(origin, pos);
      const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
      const adjustedDistFromOrigin = Math.max(distFromOrigin.x, distFromOrigin.y);

      return WeightedArray.isEvenCheckeredPoint(distFromOrigin)
        ? (1 - (adjustedDistFromOrigin / adjustedMaxDist))
        : (1 - ((adjustedMaxDist + 1 - adjustedDistFromOrigin) / adjustedMaxDist));
    }
  },

  Random: {
    Default: (pos, count, origin) => {
      return Math.random();
    }
  }
}
