import {
    type CSSAnimationKey,
    CSSConst,
    type CSSTransformKey,
    CSS_FILTER_KEYS,
    MathUtils,
    type Point2d,
} from "@thewaver/ss-utils";

import type { CellAnimationEvaluationDefs } from "./CellAnimation.types";

export namespace CellAnimationGeometry {
    export const getPointName = (pos: Point2d) => `X${pos.x}Y${pos.y}`;

    export const boundPoint = (pos: Point2d, count: Point2d): Point2d => ({
        x: Math.max(Math.min(pos.x, count.x), 0),
        y: Math.max(Math.min(pos.y, count.y), 0),
    });

    export const getMaxDistance = (origin: Point2d, count: Point2d): Point2d => ({
        x: Math.max(count.x - 1 - origin.x, origin.x, 1),
        y: Math.max(count.y - 1 - origin.y, origin.y, 1),
    });

    export const getDistance = (origin: Point2d, pos: Point2d): Point2d => ({
        x: Math.abs(pos.x - origin.x),
        y: Math.abs(pos.y - origin.y),
    });

    export const isEvenRow = (dist: Point2d) => dist.y % 2 === 0;

    export const isEvenColumn = (dist: Point2d) => dist.x % 2 === 0;

    export const isEvenRing = (dist: Point2d) =>
        !((dist.x % 2 === 1 && dist.y <= dist.x) || (dist.y % 2 === 1 && dist.x <= dist.y));

    export const isEvenCheckered = (dist: Point2d) => (dist.x + dist.y) % 2 === 0;
}

export namespace CellAnimationOrigins {
    export const ORIGIN_TYPES = [
        "center",
        "top",
        "topRight",
        "right",
        "bottomRight",
        "bottom",
        "bottomLeft",
        "left",
        "topLeft",
    ] as const;

    export type OriginType = (typeof ORIGIN_TYPES)[number];

    const originRegistry: Record<OriginType, (count: Point2d) => Point2d> = {
        center: (count) => ({ x: (count.x - 1) * 0.5, y: (count.y - 1) * 0.5 }),
        top: (count) => ({ x: (count.x - 1) * 0.5, y: 0 }),
        topRight: (count) => ({ x: count.x - 1, y: 0 }),
        right: (count) => ({ x: count.x - 1, y: (count.y - 1) * 0.5 }),
        bottomRight: (count) => ({ x: count.x - 1, y: count.y - 1 }),
        bottom: (count) => ({ x: (count.x - 1) * 0.5, y: count.y - 1 }),
        bottomLeft: (count) => ({ x: 0, y: count.y - 1 }),
        left: (count) => ({ x: 0, y: (count.y - 1) * 0.5 }),
        topLeft: () => ({ x: 0, y: 0 }),
    };

    export const computeOrigin = (type: OriginType, count: Point2d) => originRegistry[type](count);
}

export namespace CellAnimationWeights {
    export const WEIGHT_TYPES = [
        "lineRow",
        "lineColumn",
        "lineRowAlternate",
        "lineColumnAlternate",
        "lineRowConvergent",
        "lineColumnConvergent",
        "zigzagRow",
        "zigzagColumn",
        "rollRow",
        "rollColumn",
        "rollRowConvergent",
        "rollColumnConvergent",
        "entwineRow",
        "entwineColumn",
        "ovalRow",
        "ovalColumn",
        "circularDefault",
        "circularAlternate",
        "circularConvergent",
        "quadraticDefault",
        "quadraticAlternate",
        "quadraticConvergent",
        "spiralSingle",
        "spiralDouble",
        "spiralQuad",
        "radarSingle",
        "radarDouble",
        "radarQuad",
        "quadrantDefault",
        "checkeredDefault",
        "checkeredConvergent",
        "sequenceLinear",
        "sequenceConverge",
        "sequenceEvenOdd",
        "sequenceInterleaved",
        "sequenceReverseBinary",
        "randomDefault",
    ] as const;

    export type WeightType = (typeof WEIGHT_TYPES)[number];

    export const ORIGIN_FREE_WEIGHT_TYPES = [
        "sequenceLinear",
        "sequenceConverge",
        "sequenceEvenOdd",
        "sequenceInterleaved",
        "sequenceReverseBinary",
        "randomDefault",
    ] as const satisfies readonly WeightType[];

    export type OriginFreeWeightType = (typeof ORIGIN_FREE_WEIGHT_TYPES)[number];

    export const isOriginAware = (type: WeightType) =>
        !(ORIGIN_FREE_WEIGHT_TYPES as readonly WeightType[]).includes(type);

    export type WeightFn = (pos: Point2d, count: Point2d, origin: Point2d) => number;

    export type WeightOpts = {
        shouldMakeUnique?: boolean;
        shouldNormalize?: boolean;
    };

    const WEIGHT_DECIMAL_PLACES = 3;

    const getFlatIndex = (pos: Point2d, count: Point2d) => pos.y * count.x + pos.x;

    const fromOrderedIndex = (ordered: number, total: number) => (total <= 1 ? 1 : 1 - ordered / (total - 1));

    const radar = (
        pos: Point2d,
        count: Point2d,
        origin: Point2d,
        quadrantsPerSection: number,
        cdoMul: number,
        croMul: number,
        cuoMul: number,
        cloMul: number,
    ) => {
        if (pos.x === origin.x && pos.y === origin.y) return 1;

        const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
        const dist = CellAnimationGeometry.getDistance(origin, pos);
        const maxWeight = Math.max(maxDist.x, maxDist.y) * 2 * quadrantsPerSection;
        const cellsInRing = Math.max(dist.x, dist.y) * 2;
        const sectionMaxWeight = maxWeight / quadrantsPerSection;
        const increment = sectionMaxWeight / cellsInRing;
        const cdo = sectionMaxWeight * cdoMul;
        const cro = sectionMaxWeight * croMul;
        const cuo = sectionMaxWeight * cuoMul;
        const clo = sectionMaxWeight * cloMul;

        let result = 0;

        if (dist.x === 0) {
            result = pos.y < origin.y ? cuo : cdo;
        } else if (dist.y === 0) {
            result = pos.x < origin.x ? clo : cro;
        } else if (pos.x > origin.x) {
            if (pos.y > origin.y) {
                result = cdo + (dist.x + Math.max(dist.x - dist.y, 0)) * increment;
            } else if (pos.y < origin.y) {
                result = cro + (dist.y + Math.max(dist.y - dist.x, 0)) * increment;
            }
        } else if (pos.x < origin.x) {
            if (pos.y < origin.y) {
                result = cuo + (dist.x + Math.max(dist.x - dist.y, 0)) * increment;
            } else if (pos.y > origin.y) {
                result = clo + (dist.y + Math.max(dist.y - dist.x, 0)) * increment;
            }
        }

        return 1 - result / (maxWeight - 1);
    };

    const spiral = (
        pos: Point2d,
        count: Point2d,
        origin: Point2d,
        quadrantsPerSection: number,
        cdoMul: number,
        croMul: number,
        cuoMul: number,
        cloMul: number,
    ) => {
        if (pos.x === origin.x && pos.y === origin.y) return 1;

        const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
        const dist = CellAnimationGeometry.getDistance(origin, pos);
        const sectionDivider = 4 / quadrantsPerSection;
        const maxWeight = (Math.pow(Math.max(maxDist.x, maxDist.y) * 2 + 1, 2) - 1) / sectionDivider;
        const base = 1 - 1 / sectionDivider;
        const cdo = Math.pow(dist.y * 2 - 1, 2) / sectionDivider + dist.y * cdoMul + base;
        const cro = Math.pow(dist.x * 2 - 1, 2) / sectionDivider + dist.x * croMul + base;
        const cuo = Math.pow(dist.y * 2 - 1, 2) / sectionDivider + dist.y * cuoMul + base;
        const clo = Math.pow(dist.x * 2 - 1, 2) / sectionDivider + dist.x * cloMul + base;

        let result = 0;

        if (dist.x === 0) {
            result = pos.y < origin.y ? cuo : cdo;
        } else if (dist.y === 0) {
            result = pos.x < origin.x ? clo : cro;
        } else if (pos.x > origin.x) {
            if (pos.y > origin.y) {
                result = dist.y < dist.x ? cro - dist.y : cdo + dist.x;
            } else if (pos.y < origin.y) {
                result = dist.x < dist.y ? cuo - dist.x : cro + dist.y;
            }
        } else if (pos.x < origin.x) {
            if (pos.y < origin.y) {
                result = dist.y < dist.x ? clo - dist.y : cuo + dist.x;
            } else if (pos.y > origin.y) {
                result = dist.x < dist.y ? cdo - dist.x : clo + dist.y;
            }
        }

        return 1 - (result - 1) / maxWeight;
    };

    const weightRegistry: Record<WeightType, WeightFn> = {
        lineRow: (pos, count, origin) =>
            1 -
            CellAnimationGeometry.getDistance(origin, pos).y / CellAnimationGeometry.getMaxDistance(origin, count).y,

        lineColumn: (pos, count, origin) =>
            1 -
            CellAnimationGeometry.getDistance(origin, pos).x / CellAnimationGeometry.getMaxDistance(origin, count).x,

        lineRowAlternate: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - (dist.y / (maxDist.y * 2) + 0.5);
        },

        lineColumnAlternate: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - (dist.x / (maxDist.x * 2) + 0.5);
        },

        lineRowConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - ((maxDist.y + 1 - dist.y) / (maxDist.y * 2) + 0.5);
        },

        lineColumnConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - ((maxDist.x + 1 - dist.x) / (maxDist.x * 2) + 0.5);
        },

        zigzagRow: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist)
                ? (1 - dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1)
                : (dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1);
        },

        zigzagColumn: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist)
                ? (1 - dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1)
                : (dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1);
        },

        rollRow: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - (dist.x / (maxDist.x * 2) + 0.5);
        },

        rollColumn: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - (dist.y / (maxDist.y * 2) + 0.5);
        },

        rollRowConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist) ? 1 - dist.x / (maxDist.x * 2) : dist.x / (maxDist.x * 2);
        },

        rollColumnConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist) ? 1 - dist.y / (maxDist.y * 2) : dist.y / (maxDist.y * 2);
        },

        entwineRow: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenRow(dist) ? 1 - dist.x / maxDist.x : dist.x / maxDist.x;
        },

        entwineColumn: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return CellAnimationGeometry.isEvenColumn(dist) ? 1 - dist.y / maxDist.y : dist.y / maxDist.y;
        },

        ovalRow: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return (1 - dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1);
        },

        ovalColumn: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return (1 - dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1);
        },

        circularDefault: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return 1 - ((dist.x + dist.y) * 0.5) / Math.max(maxDist.x, maxDist.y);
        },

        circularAlternate: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = (dist.x + dist.y) * 0.5;

            return CellAnimationGeometry.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        circularConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = (dist.x + dist.y) * 0.5;

            return CellAnimationGeometry.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedMaxDist + 0.5 - adjustedDist) / adjustedMaxDist;
        },

        quadraticDefault: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);

            return 1 - Math.max(dist.x, dist.y) / Math.max(maxDist.x, maxDist.y);
        },

        quadraticAlternate: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationGeometry.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        quadraticConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationGeometry.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedMaxDist + 1 - adjustedDist) / adjustedMaxDist;
        },

        spiralSingle: (pos, count, origin) => spiral(pos, count, origin, 4, 1, 3, 5, 7),
        spiralDouble: (pos, count, origin) => spiral(pos, count, origin, 2, 1, 3, 1, 3),
        spiralQuad: (pos, count, origin) => spiral(pos, count, origin, 1, 1, 1, 1, 1),

        radarSingle: (pos, count, origin) => radar(pos, count, origin, 4, 0, 1, 2, 3),
        radarDouble: (pos, count, origin) => radar(pos, count, origin, 2, 0, 1, 0, 1),
        radarQuad: (pos, count, origin) => radar(pos, count, origin, 1, 0, 0, 0, 0),

        quadrantDefault: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const signedDist = { x: origin.x - pos.x, y: origin.y - pos.y };

            return (1 - (signedDist.x * signedDist.y) / (maxDist.x * maxDist.y)) * 0.5;
        },

        checkeredDefault: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationGeometry.isEvenCheckered(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        checkeredConvergent: (pos, count, origin) => {
            const maxDist = CellAnimationGeometry.getMaxDistance(origin, count);
            const dist = CellAnimationGeometry.getDistance(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationGeometry.isEvenCheckered(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedMaxDist + 1 - adjustedDist) / adjustedMaxDist;
        },

        sequenceLinear: (pos, count) => fromOrderedIndex(getFlatIndex(pos, count), count.x * count.y),

        sequenceConverge: (pos, count) => {
            const total = count.x * count.y;
            const idx = getFlatIndex(pos, count);
            const progress = total <= 1 ? 0.5 : idx / (total - 1);
            const edgeDistance = Math.abs(progress - 0.5) * 2;

            return fromOrderedIndex(Math.round((1 - edgeDistance) * (total - 1)), total);
        },

        sequenceEvenOdd: (pos, count) => {
            const total = count.x * count.y;
            const idx = getFlatIndex(pos, count);
            const evenCount = Math.ceil(total * 0.5);

            return fromOrderedIndex(MathUtils.isEven(idx) ? idx * 0.5 : evenCount + Math.floor(idx * 0.5), total);
        },

        sequenceInterleaved: (pos, count) => {
            const total = count.x * count.y;
            const idx = getFlatIndex(pos, count);
            const pair = Math.floor(idx * 0.5);

            return fromOrderedIndex(MathUtils.isEven(idx) ? pair : total - 1 - pair, total);
        },

        sequenceReverseBinary: (pos, count) => {
            const total = count.x * count.y;

            if (total <= 1) return 1;

            const bits = Math.ceil(Math.log2(total));

            return fromOrderedIndex(MathUtils.reverseBits(getFlatIndex(pos, count), bits) % total, total);
        },

        randomDefault: () => Math.random(),
    };

    const getIndexedWeights = (weights: number[][]) => {
        const indexed = new Map<number, Point2d[]>();

        for (let y = 0; y < weights.length; y++) {
            for (let x = 0; x < weights[y].length; x++) {
                const weight = weights[y][x];
                const bucket = indexed.get(weight);

                if (bucket) {
                    bucket.push({ x, y });
                } else {
                    indexed.set(weight, [{ x, y }]);
                }
            }
        }

        return indexed;
    };

    const getOrderedKeys = (indexed: Map<number, Point2d[]>) => [...indexed.keys()].sort((a, b) => a - b);

    const normalizeWeights = (weights: number[][]) => {
        const indexed = getIndexedWeights(weights);
        const orderedKeys = getOrderedKeys(indexed);

        if (orderedKeys.length <= 1) return weights;

        const result = weights.map((row) => [...row]);

        orderedKeys.forEach((key, keyIdx) => {
            for (const pos of indexed.get(key)!) {
                result[pos.y][pos.x] = MathUtils.roundToDecimalPlaces(
                    keyIdx / (orderedKeys.length - 1),
                    WEIGHT_DECIMAL_PLACES,
                );
            }
        });

        return result;
    };

    const makeWeightsUnique = (weights: number[][]) => {
        const indexed = getIndexedWeights(weights);
        const orderedKeys = getOrderedKeys(indexed);

        if (orderedKeys.length <= 1) return weights;

        const result = weights.map((row) => [...row]);
        const lastBucket = indexed.get(orderedKeys[orderedKeys.length - 1])!;
        const lastGap = orderedKeys[orderedKeys.length - 1] - orderedKeys[orderedKeys.length - 2];
        const maxWeight = 1 + lastGap * ((lastBucket.length - 1) / lastBucket.length);

        let gap = lastGap;

        orderedKeys.forEach((key, keyIdx) => {
            if (keyIdx < orderedKeys.length - 1) {
                gap = orderedKeys[keyIdx + 1] - key;
            }

            const bucket = indexed.get(key)!;

            bucket.forEach((pos, posIdx) => {
                result[pos.y][pos.x] = MathUtils.roundToDecimalPlaces(
                    (weights[pos.y][pos.x] + (posIdx / bucket.length) * gap) / maxWeight,
                    WEIGHT_DECIMAL_PLACES,
                );
            });
        });

        return result;
    };

    export const computeCellWeights = (type: WeightType, count: Point2d, origin: Point2d, opts?: WeightOpts) => {
        const boundOrigin = CellAnimationGeometry.boundPoint(origin, count);
        const compute = weightRegistry[type];

        let weights = Array.from({ length: Math.max(count.y, 0) }, (_, y) =>
            Array.from({ length: Math.max(count.x, 0) }, (_, x) =>
                MathUtils.roundToDecimalPlaces(compute({ x, y }, count, boundOrigin), WEIGHT_DECIMAL_PLACES),
            ),
        );

        if (opts?.shouldMakeUnique) weights = makeWeightsUnique(weights);
        if (opts?.shouldNormalize) weights = normalizeWeights(weights);

        return weights;
    };
}

export namespace CellAnimationZones {
    export const ZONE_TYPES = [
        "all",
        "top",
        "left",
        "bottom",
        "right",
        "quadrant1",
        "quadrant2",
        "quadrant3",
        "quadrant4",
        "axisX",
        "axisY",
        "axis1",
        "axis2",
        "axis3",
        "axis4",
        "origin",
        "evenRows",
        "oddRows",
        "evenColumns",
        "oddColumns",
        "evenRings",
        "oddRings",
        "evenCheckeredCells",
        "oddCheckeredCells",
        "lighterHalf",
        "heavierHalf",
    ] as const;

    export type ZoneType = (typeof ZONE_TYPES)[number];

    export type ZoneFn = (defs: CellAnimationEvaluationDefs) => boolean;

    const zoneRegistry: Record<ZoneType, ZoneFn> = {
        all: () => true,
        top: ({ pos, origin }) => pos.y < origin.y,
        left: ({ pos, origin }) => pos.x < origin.x,
        bottom: ({ pos, origin }) => pos.y > origin.y,
        right: ({ pos, origin }) => pos.x > origin.x,
        quadrant1: ({ pos, origin }) => pos.x > origin.x && pos.y < origin.y,
        quadrant2: ({ pos, origin }) => pos.x < origin.x && pos.y < origin.y,
        quadrant3: ({ pos, origin }) => pos.x < origin.x && pos.y > origin.y,
        quadrant4: ({ pos, origin }) => pos.x > origin.x && pos.y > origin.y,
        axisX: ({ pos, origin }) => pos.y === origin.y,
        axisY: ({ pos, origin }) => pos.x === origin.x,
        axis1: ({ pos, origin }) => pos.x === origin.x && pos.y < origin.y,
        axis2: ({ pos, origin }) => pos.x < origin.x && pos.y === origin.y,
        axis3: ({ pos, origin }) => pos.x > origin.x && pos.y === origin.y,
        axis4: ({ pos, origin }) => pos.x === origin.x && pos.y > origin.y,
        origin: ({ pos, origin }) => pos.x === origin.x && pos.y === origin.y,
        evenRows: ({ pos, origin }) => CellAnimationGeometry.isEvenRow(CellAnimationGeometry.getDistance(origin, pos)),
        oddRows: ({ pos, origin }) => !CellAnimationGeometry.isEvenRow(CellAnimationGeometry.getDistance(origin, pos)),
        evenColumns: ({ pos, origin }) =>
            CellAnimationGeometry.isEvenColumn(CellAnimationGeometry.getDistance(origin, pos)),
        oddColumns: ({ pos, origin }) =>
            !CellAnimationGeometry.isEvenColumn(CellAnimationGeometry.getDistance(origin, pos)),
        evenRings: ({ pos, origin }) =>
            CellAnimationGeometry.isEvenRing(CellAnimationGeometry.getDistance(origin, pos)),
        oddRings: ({ pos, origin }) =>
            !CellAnimationGeometry.isEvenRing(CellAnimationGeometry.getDistance(origin, pos)),
        evenCheckeredCells: ({ pos, origin }) =>
            CellAnimationGeometry.isEvenCheckered(CellAnimationGeometry.getDistance(origin, pos)),
        oddCheckeredCells: ({ pos, origin }) =>
            !CellAnimationGeometry.isEvenCheckered(CellAnimationGeometry.getDistance(origin, pos)),
        lighterHalf: ({ weight }) => weight < 0.5,
        heavierHalf: ({ weight }) => weight >= 0.5,
    };

    export const isInZone = (type: ZoneType, defs: CellAnimationEvaluationDefs) => zoneRegistry[type](defs);
}

export namespace CellAnimationBreakpoints {
    export const DIRECTIONS = ["asc", "desc"] as const;
    export type Direction = (typeof DIRECTIONS)[number];

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
    };

    export type BreakpointTupleTriple = [start: number, middle: number, end: number];

    const DEFAULT_SMOOTHNESS = 0.25;

    export const computeBreakpoints = (weight: number, opts?: BreakpointOpts): BreakpointTupleTriple => {
        const directed = opts?.dir === "desc" ? weight : 1 - weight;
        const progress = Math.min(Math.max(directed, 0), 1);
        const half = Math.min(Math.max(opts?.smoothness ?? DEFAULT_SMOOTHNESS, 0), 1) * 0.5;
        const start = progress * (1 - 2 * half);

        return [start, start + half, start + 2 * half];
    };

    export const computeLocalTimeline = ([start, , end]: BreakpointTupleTriple, timeline: number) => {
        if (end <= start) return timeline >= end ? 1 : 0;

        return Math.min(Math.max((timeline - start) / (end - start), 0), 1);
    };
}

export namespace CellAnimationUtils {
    const TRANSFORM_ORDER: readonly CSSTransformKey[] = [
        "perspective",
        "matrix",
        "matrix3d",
        "translate",
        "translate3d",
        "translateX",
        "translateY",
        "translateZ",
        "rotate",
        "rotate3d",
        "rotateX",
        "rotateY",
        "rotateZ",
        "skew",
        "skewX",
        "skewY",
        "scale",
        "scale3d",
        "scaleX",
        "scaleY",
        "scaleZ",
    ];

    const formatFunction = (key: CSSAnimationKey, value: number | number[]) => {
        const units = CSSConst.ANIMATION_UNITS[key];
        const values = Array.isArray(value) ? value : [value];
        const args = units.map((unit, idx) => `${values[idx] ?? 0}${unit}`);

        return `${key}(${args.join(", ")})`;
    };

    export const assignAnimationProps = (
        el: HTMLElement,
        evalResult: Partial<Record<CSSAnimationKey, number | number[]>>,
    ) => {
        const transforms: string[] = [];
        const filters: string[] = [];

        for (const key of TRANSFORM_ORDER) {
            const value = evalResult[key];

            if (value !== undefined) {
                transforms.push(formatFunction(key, value));
            }
        }

        for (const key of CSS_FILTER_KEYS) {
            const value = evalResult[key];

            if (value !== undefined) {
                filters.push(formatFunction(key, value));
            }
        }

        el.style.transform = transforms.join(" ");
        el.style.filter = filters.join(" ");
    };
}
