import { MathUtils, type Point2d, Point2dUtils, type Size2d } from "@thewaver/ss-utils";

export namespace CellAnimationWeightUtils {
    export const WEIGHT_DECIMAL_PLACES = 3;

    export const MIN_MAX_DISTANCE = 1;

    export const toBounds = (count: Point2d): Size2d => ({ width: count.x, height: count.y });

    export const getMaxDistance = (origin: Point2d, count: Point2d): Point2d => {
        const farthest = Point2dUtils.getFarthestBound(origin, toBounds(count));

        return { x: Math.max(farthest.x, MIN_MAX_DISTANCE), y: Math.max(farthest.y, MIN_MAX_DISTANCE) };
    };

    export const getFlatIndex = (pos: Point2d, count: Point2d) => pos.y * count.x + pos.x;

    export const fromOrderedIndex = (ordered: number, total: number) => (total <= 1 ? 1 : 1 - ordered / (total - 1));

    const HASH_OFFSET = 1;

    const HASH_MULTIPLIER_X = 374761393;

    const HASH_MULTIPLIER_Y = 668265263;

    const HASH_MULTIPLIER_MIX = 1274126177;

    const HASH_LOW_SHIFT = 13;

    const HASH_HIGH_SHIFT = 16;

    const HASH_RANGE = 4294967296;

    export const _hashToUnit = (x: number, y: number) => {
        const mixed = Math.imul(x + HASH_OFFSET, HASH_MULTIPLIER_X) ^ Math.imul(y + HASH_OFFSET, HASH_MULTIPLIER_Y);
        const folded = Math.imul(mixed ^ (mixed >>> HASH_LOW_SHIFT), HASH_MULTIPLIER_MIX);

        return ((folded ^ (folded >>> HASH_HIGH_SHIFT)) >>> 0) / HASH_RANGE;
    };

    export const _interleaveBits = (x: number, y: number, bits: number) => {
        let result = 0;

        for (let bit = 0; bit < bits; bit++) {
            result |= ((x >> bit) & 1) << (bit * 2);
            result |= ((y >> bit) & 1) << (bit * 2 + 1);
        }

        return result;
    };

    export const _greatestCommonDivisor = (a: number, b: number) => {
        let high = Math.max(a, b);
        let low = Math.min(a, b);

        while (low > 0) {
            const remainder = high % low;

            high = low;
            low = remainder;
        }

        return high;
    };

    export const radar = (
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

    export const spiral = (
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

        return MathUtils.clamp01(1 - (result - 1) / maxWeight);
    };
}
