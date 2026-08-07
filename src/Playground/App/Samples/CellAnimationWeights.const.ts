import { MathUtils, type Point2d, Point2dUtils, type Size2d } from "@thewaver/ss-utils";

import { CellAnimationUtils } from "../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";

export namespace CellAnimationWeights {
    export const WEIGHT_TYPES = [
        "checkeredConvergent",
        "checkeredDefault",
        "circularAlternate",
        "circularConvergent",
        "circularDefault",
        "entwineColumn",
        "entwineRow",
        "lineColumn",
        "lineColumnAlternate",
        "lineColumnConvergent",
        "lineRow",
        "lineRowAlternate",
        "lineRowConvergent",
        "ovalColumn",
        "ovalRow",
        "quadrantDefault",
        "quadraticAlternate",
        "quadraticConvergent",
        "quadraticDefault",
        "radarDouble",
        "radarQuad",
        "radarSingle",
        "randomDefault",
        "rollColumn",
        "rollColumnConvergent",
        "rollRow",
        "rollRowConvergent",
        "sequenceConverge",
        "sequenceEvenOdd",
        "sequenceInterleaved",
        "sequenceLinear",
        "sequenceReverseBinary",
        "spiralDouble",
        "spiralQuad",
        "spiralSingle",
        "zigzagColumn",
        "zigzagRow",
    ] as const;
    export type WeightType = (typeof WEIGHT_TYPES)[number];

    export const ORIGIN_FREE_WEIGHT_TYPES = [
        "sequenceConverge",
        "sequenceEvenOdd",
        "sequenceInterleaved",
        "sequenceLinear",
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

    const MIN_MAX_DISTANCE = 1;

    const toBounds = (count: Point2d): Size2d => ({ width: count.x, height: count.y });

    const getMaxDistance = (origin: Point2d, count: Point2d): Point2d => {
        const farthest = Point2dUtils.getFarthestBound(origin, toBounds(count));

        return { x: Math.max(farthest.x, MIN_MAX_DISTANCE), y: Math.max(farthest.y, MIN_MAX_DISTANCE) };
    };

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

        const maxDist = getMaxDistance(origin, count);
        const dist = Point2dUtils.getDelta(origin, pos);
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

        const maxDist = getMaxDistance(origin, count);
        const dist = Point2dUtils.getDelta(origin, pos);
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
        lineRow: (pos, count, origin) => 1 - Point2dUtils.getDelta(origin, pos).y / getMaxDistance(origin, count).y,

        lineColumn: (pos, count, origin) => 1 - Point2dUtils.getDelta(origin, pos).x / getMaxDistance(origin, count).x,

        lineRowAlternate: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - (dist.y / (maxDist.y * 2) + 0.5);
        },

        lineColumnAlternate: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - (dist.x / (maxDist.x * 2) + 0.5);
        },

        lineRowConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - ((maxDist.y + 1 - dist.y) / (maxDist.y * 2) + 0.5);
        },

        lineColumnConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - ((maxDist.x + 1 - dist.x) / (maxDist.x * 2) + 0.5);
        },

        zigzagRow: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist)
                ? (1 - dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1)
                : (dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1);
        },

        zigzagColumn: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist)
                ? (1 - dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1)
                : (dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1);
        },

        rollRow: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist)
                ? 1 - dist.x / (maxDist.x * 2)
                : 1 - (dist.x / (maxDist.x * 2) + 0.5);
        },

        rollColumn: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist)
                ? 1 - dist.y / (maxDist.y * 2)
                : 1 - (dist.y / (maxDist.y * 2) + 0.5);
        },

        rollRowConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist) ? 1 - dist.x / (maxDist.x * 2) : dist.x / (maxDist.x * 2);
        },

        rollColumnConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist) ? 1 - dist.y / (maxDist.y * 2) : dist.y / (maxDist.y * 2);
        },

        entwineRow: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenRow(dist) ? 1 - dist.x / maxDist.x : dist.x / maxDist.x;
        },

        entwineColumn: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return CellAnimationUtils.isEvenColumn(dist) ? 1 - dist.y / maxDist.y : dist.y / maxDist.y;
        },

        ovalRow: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return (1 - dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1);
        },

        ovalColumn: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return (1 - dist.y / maxDist.y + (maxDist.x - dist.x)) / (maxDist.x + 1);
        },

        circularDefault: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return 1 - ((dist.x + dist.y) * 0.5) / Math.max(maxDist.x, maxDist.y);
        },

        circularAlternate: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = (dist.x + dist.y) * 0.5;

            return CellAnimationUtils.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        circularConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = (dist.x + dist.y) * 0.5;

            return CellAnimationUtils.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedMaxDist + 0.5 - adjustedDist) / adjustedMaxDist;
        },

        quadraticDefault: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);

            return 1 - Math.max(dist.x, dist.y) / Math.max(maxDist.x, maxDist.y);
        },

        quadraticAlternate: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationUtils.isEvenRing(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        quadraticConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationUtils.isEvenRing(dist)
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
            const maxDist = getMaxDistance(origin, count);
            const signedDist = { x: origin.x - pos.x, y: origin.y - pos.y };

            return (1 - (signedDist.x * signedDist.y) / (maxDist.x * maxDist.y)) * 0.5;
        },

        checkeredDefault: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationUtils.isEvenCheckered(dist)
                ? 1 - adjustedDist / adjustedMaxDist
                : 1 - (adjustedDist / adjustedMaxDist + 0.5);
        },

        checkeredConvergent: (pos, count, origin) => {
            const maxDist = getMaxDistance(origin, count);
            const dist = Point2dUtils.getDelta(origin, pos);
            const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
            const adjustedDist = Math.max(dist.x, dist.y);

            return CellAnimationUtils.isEvenCheckered(dist)
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
        const boundOrigin = Point2dUtils.getBoundPoint(origin, toBounds(count));
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
