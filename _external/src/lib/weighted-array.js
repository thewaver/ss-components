import { point, boundPoint, pointName } from './point-utils';

const getIndexedCellWeights = (cellWeights) => {
  let weightDistribution = {};
  let weight;

  for (let row = 0; row < cellWeights.length; row++) {
    for (let col = 0; col < cellWeights[row].length; col++) {
      weight = cellWeights[row][col];
      if (weightDistribution[weight]) {
        weightDistribution[weight].push(point(col, row));
      } else {
        weightDistribution[weight] = [point(col, row)];
      }
    }
  }

  return weightDistribution; 
}

export const WeightedArray = {
  getCellsOfZone: (cellWeights, origin, zoneFunc) => {
    let points = [];

    for (let row = 0; row < cellWeights.length; row++) {
      for (let col = 0; col < cellWeights[row].length; col++) {
        if (zoneFunc(point(col, row), origin, cellWeights[row][col])) {
          points.push(pointName(col, row));
        }
      }
    }

    return points;
  },

  getCellWeights: (count, origin, weightFunc) => {
    const boundOrigin = boundPoint(origin, count);
    let cellWeights = [];
    let row = [];

    for (let y = 0; y < count.y; y++) {
      for (let x = 0; x < count.x; x++) {
        row.push(+weightFunc(point(x, y), count, boundOrigin).toFixed(3));
      }

      cellWeights.push(row);
      row = [];
    }

    return cellWeights;
  },

  invertAllCells: (cellWeights) => {
    for (let row = 0; row < cellWeights.length; row++) {
      for (let col = 0; col < cellWeights[row].length; col++) {
        cellWeights[row][col] = 1 - cellWeights[row][col];
      }
    }

    return cellWeights;
  },

  invertColumns: (cellWeights) => {
    for (let row = 0; row < cellWeights.length / 2; row++) {
      for (let col = 0; col < cellWeights[row].length; col++) {
        const temp = cellWeights[row][col];
        cellWeights[row][col] = cellWeights[cellWeights.length - 1 - row][col];
        cellWeights[cellWeights.length - 1 - row][col] = temp;
      }
    }

    return cellWeights;
  },

  invertRows: (cellWeights) => {
    for (let row = 0; row < cellWeights.length; row++) {
      for (let col = 0; col < cellWeights[row].length / 2; col++) {
        const temp = cellWeights[row][col];
        cellWeights[row][col] = cellWeights[row][cellWeights[row].length - 1 - col];
        cellWeights[row][cellWeights[row].length - 1 - col] = temp;
      }
    }

    return cellWeights;
  },

  normalizeCells: (cellWeights) => {
    const indexedCellWeights = getIndexedCellWeights(cellWeights);
    const orderedKeys = Object.keys(indexedCellWeights).sort();

    if (orderedKeys.length > 1) {
      let point;

      for (let key = 0; key < orderedKeys.length; key++) {
        for (let wic = 0; wic < indexedCellWeights[orderedKeys[key]].length; wic++) {
          point = indexedCellWeights[orderedKeys[key]][wic];
          cellWeights[point.y][point.x] = +(key / (orderedKeys.length - 1)).toFixed(3);
        }
      }
    }

    return cellWeights;
  },

  makeCellsUnique: (cellWeights) => {
    const indexedCellWeights = getIndexedCellWeights(cellWeights);
    const orderedKeys = Object.keys(indexedCellWeights).sort();

    if (orderedKeys.length > 1) {
      let point;
      let weightDiff;
      let maxWeight = 1 + (orderedKeys[orderedKeys.length - 1] - orderedKeys[orderedKeys.length - 2]) * ((indexedCellWeights[orderedKeys[orderedKeys.length - 1]].length - 1) / indexedCellWeights[orderedKeys[orderedKeys.length - 1]].length);

      for (let key = 0; key < orderedKeys.length; key++) {
        if (key < orderedKeys.length - 1) {
          weightDiff = orderedKeys[key + 1] - orderedKeys[key];
        }
  
        for (let wic = 0; wic < indexedCellWeights[orderedKeys[key]].length; wic++) {
          point = indexedCellWeights[orderedKeys[key]][wic];
          cellWeights[point.y][point.x] = +((cellWeights[point.y][point.x] + (wic / indexedCellWeights[orderedKeys[key]].length) * weightDiff) / maxWeight).toFixed(3);
        }
      }
    }

    return cellWeights;
  },

  isOrigin: (distFromOrigin) => {
    return (distFromOrigin.x === 0 && distFromOrigin.y === 0);
  },

  isEvenRowPoint: (distFromOrigin) => {
    return (distFromOrigin.y % 2 === 0);
  },

  isEvenColumnPoint: (distFromOrigin) => {
    return (distFromOrigin.x % 2 === 0);
  },

  isEvenRingPoint: (distFromOrigin) => {
    return !(((distFromOrigin.x % 2 === 1) && (distFromOrigin.y <= distFromOrigin.x)) || 
      ((distFromOrigin.y % 2 === 1) && (distFromOrigin.x <= distFromOrigin.y)));
  },

  isEvenCheckeredPoint: (distFromOrigin) => {
    return ((distFromOrigin.x + distFromOrigin.y) % 2 === 0);
  }
}