import { SVGUtils } from "@thewaver/ss-utils";

const DEGREES_TO_RADIANS = Math.PI / 180;

export namespace SVGAnimationTracks {
    export const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

    export const computeOffsetTrack = (base: number, offsets: number[]) => offsets.map((offset) => base + offset);

    export const computeGrowTracks = (from: number, to: number, scales: number[]) => {
        const halfDist = Math.abs(to - from) * 0.5;

        return {
            from: scales.map((scale) => from + halfDist - halfDist * scale),
            to: scales.map((scale) => to - halfDist + halfDist * scale),
        };
    };

    export const computeDiagonalTracks = (x: number, y: number, angle: number, offsets: number[]) => {
        const diagonalRad = angle * DEGREES_TO_RADIANS;

        return {
            x: offsets.map((offset) => x + offset * Math.cos(diagonalRad)),
            y: offsets.map((offset) => y + offset * Math.sin(diagonalRad)),
        };
    };

    export const computeRotationTracks = (angles: number[]) => {
        const steps = angles.map((angle) => SVGUtils.getLinearCoords({ angle }));

        return Object.fromEntries(V_KEYS.map((key) => [key, steps.map((step) => step[key])])) as Record<
            (typeof V_KEYS)[number],
            number[]
        >;
    };
}
