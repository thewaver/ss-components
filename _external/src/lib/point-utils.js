export const point = (x, y) => {
  return { x, y };
}

export const boundPoint = (basePoint, maxPoint) => {
  return point(
    Math.max(Math.min(basePoint.x, maxPoint.x), 0),
    Math.max(Math.min(basePoint.y, maxPoint.y), 0)
  );
}

export const pointName = (x, y) => {
  return `X${x}Y${y}`;
}

export const getMaxDist = (point1, bounds) => {
  const maxDistX = Math.max(Math.max(bounds.x - 1 - point1.x, point1.x), 1);
  const maxDistY = Math.max(Math.max(bounds.y - 1 - point1.y, point1.y), 1);

  return point(maxDistX, maxDistY);
}

export const getDistFromPoint = (point1, point2) => {
  const distFromOriginX = Math.abs(point2.x - point1.x);
  const distFromOriginY = Math.abs(point2.y - point1.y);

  return point(distFromOriginX, distFromOriginY);
}
