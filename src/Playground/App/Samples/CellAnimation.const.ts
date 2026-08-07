import { type CSSAnimationKey, MathUtils } from "@thewaver/ss-utils";

import {
    CellAnimationBreakpoints,
    type CellAnimationEvaluationDefs,
    type CellAnimationEvaluationResult,
    CellAnimationZones,
} from "../../../Lib";

export namespace CellAnimationKeyframesConst {
    type CellStop = { at: number; originX?: number; originY?: number; depth?: number } & Partial<
        Record<CSSAnimationKey, number>
    >;

    type Matrix3 = [number, number, number, number, number, number, number, number, number];

    type Vector3 = [number, number, number];

    type CellStopTrack = { at: number; value: number }[];

    type CompiledCellStops = Record<string, CellStopTrack>;

    type CellAnimationFn = (timeline: number, defs: CellAnimationEvaluationDefs) => CellAnimationEvaluationResult;

    const RESULT_DECIMAL_PLACES = 3;

    const compileStops = (stops: CellStop[]): CompiledCellStops => {
        const compiled: CompiledCellStops = {};

        for (const stop of stops) {
            for (const [key, value] of Object.entries(stop)) {
                if (key === "at" || value === undefined) continue;

                compiled[key] ??= [];
                compiled[key].push({ at: stop.at, value });
            }
        }

        return compiled;
    };

    const sampleTrack = (track: CellStopTrack, timeline: number) => {
        if (timeline <= track[0].at) return track[0].value;

        for (let i = 1; i < track.length; i++) {
            if (timeline <= track[i].at) {
                const span = track[i].at - track[i - 1].at;
                const ratio = span <= 0 ? 1 : (timeline - track[i - 1].at) / span;

                return track[i - 1].value + (track[i].value - track[i - 1].value) * ratio;
            }
        }

        return track[track.length - 1].value;
    };

    const multiply = (a: Matrix3, b: Matrix3): Matrix3 =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
            const row = Math.floor(idx / 3) * 3;
            const col = idx % 3;

            return a[row] * b[col] + a[row + 1] * b[3 + col] + a[row + 2] * b[6 + col];
        }) as Matrix3;

    const apply = (m: Matrix3, v: Vector3): Vector3 => [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
    ];

    const rotationZ = (degrees: number): Matrix3 => {
        const radians = (degrees * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
    };

    const rotationX = (degrees: number): Matrix3 => {
        const radians = (degrees * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [1, 0, 0, 0, cos, -sin, 0, sin, cos];
    };

    const rotationY = (degrees: number): Matrix3 => {
        const radians = (degrees * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return [cos, 0, sin, 0, 1, 0, -sin, 0, cos];
    };

    const scaling = (scaleX: number, scaleY: number): Matrix3 => [scaleX, 0, 0, 0, scaleY, 0, 0, 0, 1];

    const fromStops = (stops: CellStop[]): CellAnimationFn => {
        const compiled = compileStops(stops);

        return (timeline, defs) => {
            const result: Partial<Record<CSSAnimationKey, number>> = {};

            let originX: number | undefined;
            let originY: number | undefined;
            let depth: number | undefined;

            for (const [key, track] of Object.entries(compiled)) {
                const value = sampleTrack(track, timeline);

                if (key === "originX") {
                    originX = value;
                } else if (key === "originY") {
                    originY = value;
                } else if (key === "depth") {
                    depth = value;
                } else {
                    result[key as CSSAnimationKey] = MathUtils.roundToDecimalPlaces(value, RESULT_DECIMAL_PLACES);
                }
            }

            if (originX === undefined && originY === undefined && depth === undefined) return result;

            const { width, height } = defs.size;
            const anchor: Vector3 = [((originX ?? 0.5) - 0.5) * width, ((originY ?? 0.5) - 0.5) * height, 0];
            const offset: Vector3 = [0, 0, ((depth ?? 0) * Math.max(width, height)) / 100];
            const matrix = multiply(
                multiply(
                    multiply(rotationZ(result.rotate ?? 0), rotationX(result.rotateX ?? 0)),
                    rotationY(result.rotateY ?? 0),
                ),
                scaling((result.scaleX ?? 100) / 100, (result.scaleY ?? 100) / 100),
            );
            const rotatedAnchor = apply(matrix, anchor);
            const rotatedOffset = apply(matrix, offset);
            const translation: Vector3 = [
                anchor[0] - rotatedAnchor[0] + rotatedOffset[0],
                anchor[1] - rotatedAnchor[1] + rotatedOffset[1],
                anchor[2] - rotatedAnchor[2] + rotatedOffset[2],
            ];

            result.translateX = MathUtils.roundToDecimalPlaces(
                (result.translateX ?? 0) + (width > 0 ? (translation[0] / width) * 100 : 0),
                RESULT_DECIMAL_PLACES,
            );
            result.translateY = MathUtils.roundToDecimalPlaces(
                (result.translateY ?? 0) + (height > 0 ? (translation[1] / height) * 100 : 0),
                RESULT_DECIMAL_PLACES,
            );

            if (translation[2] !== 0 || result.translateZ !== undefined) {
                result.translateZ = MathUtils.roundToDecimalPlaces(
                    (result.translateZ ?? 0) + translation[2],
                    RESULT_DECIMAL_PLACES,
                );
            }

            return result;
        };
    };

    export const ANIMATION_TYPES = [
        "zoomIn",
        "zoomOut",
        "fadeInLinear",
        "fadeInFlash",
        "fadeInFlicker",
        "bounceDefault",
        "skewCw",
        "skewCcw",
        "popCenter",
        "popTopLeft",
        "popTopRight",
        "popBottomRight",
        "popBottomLeft",
        "pullVertical",
        "pullHorizontal",
        "pullDown",
        "pullUp",
        "pullRight",
        "pullLeft",
        "shootUp",
        "shakeDown",
        "dripDefault",
        "elasticRight",
        "elasticLeft",
        "elasticUp",
        "elasticDown",
        "rollDownLeft",
        "rollDownRight",
        "rollUpLeft",
        "rollUpRight",
        "hopRight",
        "hopLeft",
        "spinUpCw",
        "spinUpCcw",
        "spinDownCw",
        "spinDownCcw",
        "swarmCw",
        "swarmCcw",
        "blurDefault",
        "tumbleRight",
        "tumbleLeft",
        "encircleCw",
        "encircleCcw",
        "hingeTop",
        "hingeBottom",
        "hingeLeft",
        "hingeRight",
        "carouselTop",
        "carouselBottom",
        "carouselLeft",
        "carouselRight",
        "quadrantScatter",
    ] as const;

    export type AnimationType = (typeof ANIMATION_TYPES)[number];

    const animationRegistry: Record<AnimationType, CellAnimationFn> = {
        blurDefault: fromStops([
            { at: 0, opacity: 0, blur: 20 },
            { at: 0.5, opacity: 100 },
            { at: 1, blur: 0 },
        ]),

        bounceDefault: fromStops([
            { at: 0, scaleX: 0, scaleY: 0 },
            { at: 0.25, scaleX: 50, scaleY: 200 },
            { at: 0.5, scaleX: 200, scaleY: 50 },
            { at: 0.75, scaleX: 50, scaleY: 200 },
            { at: 1, scaleX: 100, scaleY: 100 },
        ]),

        carouselBottom: fromStops([
            { at: 0, originY: 1, opacity: 0, rotateX: -90, depth: 240 },
            { at: 0.25, opacity: 100 },
            { at: 1, originY: 1, rotateX: 0, depth: 0 },
        ]),

        carouselLeft: fromStops([
            { at: 0, originX: 0, opacity: 0, rotateY: -90, depth: 240 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 0, rotateY: 0, depth: 0 },
        ]),

        carouselRight: fromStops([
            { at: 0, originX: 1, opacity: 0, rotateY: 90, depth: 240 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 1, rotateY: 0, depth: 0 },
        ]),

        carouselTop: fromStops([
            { at: 0, originY: 0, opacity: 0, rotateX: 90, depth: 240 },
            { at: 0.25, opacity: 100 },
            { at: 1, originY: 0, rotateX: 0, depth: 0 },
        ]),

        dripDefault: fromStops([
            { at: 0, originY: 1, opacity: 0, scaleY: 400, translateY: -1600 },
            { at: 0.25, opacity: 100 },
            { at: 0.75, scaleY: 0, translateY: 0 },
            { at: 1, originY: 1, scaleY: 100, translateY: 0 },
        ]),

        elasticDown: fromStops([
            { at: 0, originY: 0, opacity: 0, scaleY: 100, translateY: 400 },
            { at: 0.25, opacity: 100 },
            { at: 0.5, scaleY: 400, translateY: 0 },
            { at: 1, originY: 0, scaleY: 100, translateY: 0 },
        ]),

        elasticLeft: fromStops([
            { at: 0, originX: 1, opacity: 0, scaleX: 100, translateX: -400 },
            { at: 0.25, opacity: 100 },
            { at: 0.5, scaleX: 400, translateX: 0 },
            { at: 1, originX: 1, scaleX: 100, translateX: 0 },
        ]),

        elasticRight: fromStops([
            { at: 0, originX: 0, opacity: 0, scaleX: 100, translateX: 400 },
            { at: 0.25, opacity: 100 },
            { at: 0.5, scaleX: 400, translateX: 0 },
            { at: 1, originX: 0, scaleX: 100, translateX: 0 },
        ]),

        elasticUp: fromStops([
            { at: 0, originY: 1, opacity: 0, scaleY: 100, translateY: -400 },
            { at: 0.25, opacity: 100 },
            { at: 0.5, scaleY: 400, translateY: 0 },
            { at: 1, originY: 1, scaleY: 100, translateY: 0 },
        ]),

        encircleCcw: fromStops([
            { at: 0, originX: 1, originY: 1, scaleX: 0, scaleY: 0 },
            { at: 0.33, originX: 1, originY: 0 },
            { at: 0.66, originX: 0, originY: 0 },
            { at: 1, originX: 0, originY: 1, scaleX: 100, scaleY: 100 },
        ]),

        encircleCw: fromStops([
            { at: 0, originX: 0, originY: 0, scaleX: 0, scaleY: 0 },
            { at: 0.33, originX: 1, originY: 0 },
            { at: 0.66, originX: 1, originY: 1 },
            { at: 1, originX: 0, originY: 1, scaleX: 100, scaleY: 100 },
        ]),

        fadeInFlash: fromStops([
            { at: 0, opacity: 0, saturate: 50, brightness: 200 },
            { at: 0.5, opacity: 100, saturate: 50, brightness: 200 },
            { at: 1, saturate: 100, brightness: 100 },
        ]),

        fadeInFlicker: fromStops([
            { at: 0, opacity: 0 },
            { at: 0.1, opacity: 100 },
            { at: 0.2, opacity: 100 },
            { at: 0.25, opacity: 50 },
            { at: 0.3, opacity: 100 },
            { at: 0.4, opacity: 100 },
            { at: 0.45, opacity: 75 },
            { at: 0.5, opacity: 100 },
            { at: 0.6, opacity: 100 },
            { at: 0.65, opacity: 50 },
            { at: 0.7, opacity: 100 },
            { at: 0.8, opacity: 100 },
            { at: 0.85, opacity: 75 },
            { at: 0.9, opacity: 100 },
            { at: 1, opacity: 100 },
        ]),

        fadeInLinear: fromStops([
            { at: 0, opacity: 0 },
            { at: 1, opacity: 100 },
        ]),

        hingeBottom: fromStops([
            { at: 0, originY: 1, opacity: 0, rotateX: -90 },
            { at: 0.25, opacity: 100 },
            { at: 0.75, rotateX: 45 },
            { at: 1, originY: 1, rotateX: 0 },
        ]),

        hingeLeft: fromStops([
            { at: 0, originX: 0, opacity: 0, rotateY: -90 },
            { at: 0.25, opacity: 100 },
            { at: 0.75, rotateY: 45 },
            { at: 1, originX: 0, rotateY: 0 },
        ]),

        hingeRight: fromStops([
            { at: 0, originX: 1, opacity: 0, rotateY: 90 },
            { at: 0.25, opacity: 100 },
            { at: 0.75, rotateY: -45 },
            { at: 1, originX: 1, rotateY: 0 },
        ]),

        hingeTop: fromStops([
            { at: 0, originY: 0, opacity: 0, rotateX: 90 },
            { at: 0.25, opacity: 100 },
            { at: 0.75, rotateX: -45 },
            { at: 1, originY: 0, rotateX: 0 },
        ]),

        hopLeft: fromStops([
            { at: 0, opacity: 0, translateX: 400, translateY: 0, scaleX: 20, scaleY: 20 },
            { at: 0.25, opacity: 100, translateX: 300, translateY: -200, scaleX: 40, scaleY: 40 },
            { at: 0.5, translateX: 200, translateY: 0, scaleX: 60, scaleY: 60 },
            { at: 0.75, translateX: 100, translateY: -100, scaleX: 80, scaleY: 80 },
            { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100 },
        ]),

        hopRight: fromStops([
            { at: 0, opacity: 0, translateX: -400, translateY: 0, scaleX: 20, scaleY: 20 },
            { at: 0.25, opacity: 100, translateX: -300, translateY: -200, scaleX: 40, scaleY: 40 },
            { at: 0.5, translateX: -200, translateY: 0, scaleX: 60, scaleY: 60 },
            { at: 0.75, translateX: -100, translateY: -100, scaleX: 80, scaleY: 80 },
            { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100 },
        ]),

        popBottomLeft: fromStops([
            { at: 0, originX: 0, originY: 1, scaleX: 0, scaleY: 0 },
            { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
            { at: 0.75, scaleX: 150, scaleY: 150 },
            { at: 1, originX: 0, originY: 1, scaleX: 100, scaleY: 100 },
        ]),

        popBottomRight: fromStops([
            { at: 0, originX: 1, originY: 1, scaleX: 0, scaleY: 0 },
            { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
            { at: 0.75, scaleX: 150, scaleY: 150 },
            { at: 1, originX: 1, originY: 1, scaleX: 100, scaleY: 100 },
        ]),

        popCenter: fromStops([
            { at: 0, scaleX: 0, scaleY: 0 },
            { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
            { at: 0.75, scaleX: 150, scaleY: 150 },
            { at: 1, scaleX: 100, scaleY: 100 },
        ]),

        popTopLeft: fromStops([
            { at: 0, originX: 0, originY: 0, scaleX: 0, scaleY: 0 },
            { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
            { at: 0.75, scaleX: 150, scaleY: 150 },
            { at: 1, originX: 0, originY: 0, scaleX: 100, scaleY: 100 },
        ]),

        popTopRight: fromStops([
            { at: 0, originX: 1, originY: 0, scaleX: 0, scaleY: 0 },
            { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
            { at: 0.75, scaleX: 150, scaleY: 150 },
            { at: 1, originX: 1, originY: 0, scaleX: 100, scaleY: 100 },
        ]),

        pullDown: fromStops([
            { at: 0, originY: 0, scaleY: 0 },
            { at: 1, originY: 0, scaleY: 100 },
        ]),

        pullHorizontal: fromStops([
            { at: 0, scaleX: 100, scaleY: 0 },
            { at: 1, scaleX: 100, scaleY: 100 },
        ]),

        pullLeft: fromStops([
            { at: 0, originX: 1, scaleX: 0 },
            { at: 1, originX: 1, scaleX: 100 },
        ]),

        pullRight: fromStops([
            { at: 0, originX: 0, scaleX: 0 },
            { at: 1, originX: 0, scaleX: 100 },
        ]),

        pullUp: fromStops([
            { at: 0, originY: 1, scaleY: 0 },
            { at: 1, originY: 1, scaleY: 100 },
        ]),

        pullVertical: fromStops([
            { at: 0, scaleX: 0, scaleY: 100 },
            { at: 1, scaleX: 100, scaleY: 100 },
        ]),

        quadrantScatter: (timeline, defs) => {
            const offset = (1 - timeline) * 200;
            const scale = 20 + timeline * 80;

            return {
                translateX: CellAnimationZones.isInZone("right", defs)
                    ? offset
                    : CellAnimationZones.isInZone("left", defs)
                      ? -offset
                      : 0,
                translateY: CellAnimationZones.isInZone("bottom", defs)
                    ? offset
                    : CellAnimationZones.isInZone("top", defs)
                      ? -offset
                      : 0,
                scaleX: scale,
                scaleY: scale,
                opacity: timeline * 100,
            };
        },

        rollDownLeft: fromStops([
            { at: 0, opacity: 0, translateX: -400, translateY: -400, rotate: -90 },
            { at: 0.25, opacity: 100 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        rollDownRight: fromStops([
            { at: 0, opacity: 0, translateX: 400, translateY: -400, rotate: 90 },
            { at: 0.25, opacity: 100 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        rollUpLeft: fromStops([
            { at: 0, opacity: 0, translateX: -400, translateY: 400, rotate: -90 },
            { at: 0.25, opacity: 100 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        rollUpRight: fromStops([
            { at: 0, opacity: 0, translateX: 400, translateY: 400, rotate: 90 },
            { at: 0.25, opacity: 100 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        shakeDown: fromStops([
            { at: 0, opacity: 0, translateX: -100, translateY: -800, rotate: 20 },
            { at: 0.25, opacity: 100, translateX: 100, translateY: -600, rotate: -20 },
            { at: 0.5, translateX: -50, translateY: -400, rotate: 10 },
            { at: 0.75, translateX: 50, translateY: -200, rotate: -10 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        shootUp: fromStops([
            { at: 0, opacity: 0, translateY: 800, scaleX: 100, scaleY: 100 },
            { at: 0.25, opacity: 100 },
            { at: 0.66, translateY: -400, scaleX: 150, scaleY: 150 },
            { at: 1, translateY: 0, scaleX: 100, scaleY: 100 },
        ]),

        skewCcw: fromStops([
            { at: 0, skewX: 45, skewY: 45 },
            { at: 1, skewX: 0, skewY: 0 },
        ]),

        skewCw: fromStops([
            { at: 0, skewX: -45, skewY: -45 },
            { at: 1, skewX: 0, skewY: 0 },
        ]),

        spinDownCcw: fromStops([
            { at: 0, originX: -4, originY: -4, opacity: 0, rotate: 360 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 0.5, originY: 0.5, rotate: 0 },
        ]),

        spinDownCw: fromStops([
            { at: 0, originX: -4, originY: -4, opacity: 0, rotate: -360 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 0.5, originY: 0.5, rotate: 0 },
        ]),

        spinUpCcw: fromStops([
            { at: 0, originX: 4, originY: 4, opacity: 0, rotate: 360 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 0.5, originY: 0.5, rotate: 0 },
        ]),

        spinUpCw: fromStops([
            { at: 0, originX: 4, originY: 4, opacity: 0, rotate: -360 },
            { at: 0.25, opacity: 100 },
            { at: 1, originX: 0.5, originY: 0.5, rotate: 0 },
        ]),

        swarmCcw: fromStops([
            { at: 0, translateX: 200, translateY: 200, scaleX: 0, scaleY: 0, rotate: 360 },
            { at: 0.1, translateX: 200, translateY: -200, scaleX: 5, scaleY: 5, rotate: 360 },
            { at: 0.2, translateX: -200, translateY: -200, scaleX: 10, scaleY: 10, rotate: 320 },
            { at: 0.3, translateX: -200, translateY: 200, scaleX: 15, scaleY: 15, rotate: 280 },
            { at: 0.4, translateX: 100, translateY: 200, scaleX: 20, scaleY: 20, rotate: 240 },
            { at: 0.5, translateX: 100, translateY: -100, scaleX: 25, scaleY: 25, rotate: 200 },
            { at: 0.6, translateX: -100, translateY: -100, scaleX: 35, scaleY: 35, rotate: 160 },
            { at: 0.7, translateX: -100, translateY: 100, scaleX: 45, scaleY: 45, rotate: 120 },
            { at: 0.8, translateX: 0, translateY: 100, scaleX: 60, scaleY: 60, rotate: 80 },
            { at: 0.9, translateX: 0, translateY: 0, scaleX: 80, scaleY: 80, rotate: 40 },
            { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100, rotate: 0 },
        ]),

        swarmCw: fromStops([
            { at: 0, translateX: -200, translateY: -200, scaleX: 0, scaleY: 0, rotate: -360 },
            { at: 0.1, translateX: 200, translateY: -200, scaleX: 5, scaleY: 5, rotate: -360 },
            { at: 0.2, translateX: 200, translateY: 200, scaleX: 10, scaleY: 10, rotate: -320 },
            { at: 0.3, translateX: -200, translateY: 200, scaleX: 15, scaleY: 15, rotate: -280 },
            { at: 0.4, translateX: -200, translateY: -100, scaleX: 20, scaleY: 20, rotate: -240 },
            { at: 0.5, translateX: 100, translateY: -100, scaleX: 25, scaleY: 25, rotate: -200 },
            { at: 0.6, translateX: 100, translateY: 100, scaleX: 30, scaleY: 30, rotate: -160 },
            { at: 0.7, translateX: -100, translateY: 100, scaleX: 45, scaleY: 45, rotate: -120 },
            { at: 0.8, translateX: -100, translateY: 0, scaleX: 60, scaleY: 60, rotate: -80 },
            { at: 0.9, translateX: 0, translateY: 0, scaleX: 80, scaleY: 80, rotate: -40 },
            { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100, rotate: 0 },
        ]),

        tumbleLeft: fromStops([
            { at: 0, opacity: 0, translateX: 200, translateY: 0, rotate: 180 },
            { at: 0.25, opacity: 100, translateX: 150, translateY: 50, rotate: 135 },
            { at: 0.5, translateX: 100, translateY: 0, rotate: 90 },
            { at: 0.75, translateX: 50, translateY: 25, rotate: 45 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        tumbleRight: fromStops([
            { at: 0, opacity: 0, translateX: -200, translateY: 0, rotate: -180 },
            { at: 0.25, opacity: 100, translateX: -150, translateY: 50, rotate: -135 },
            { at: 0.5, translateX: -100, translateY: 0, rotate: -90 },
            { at: 0.75, translateX: -50, translateY: 25, rotate: -45 },
            { at: 1, translateX: 0, translateY: 0, rotate: 0 },
        ]),

        zoomIn: fromStops([
            { at: 0, scaleX: 0, scaleY: 0 },
            { at: 1, scaleX: 100, scaleY: 100 },
        ]),

        zoomOut: fromStops([
            { at: 0, opacity: 0, scaleX: 400, scaleY: 400, brightness: 80 },
            { at: 0.25, opacity: 100 },
            { at: 1, scaleX: 100, scaleY: 100, brightness: 100 },
        ]),
    };

    export const computeAnimation = (
        type: AnimationType,
        breakpoints: CellAnimationBreakpoints.BreakpointTupleTriple,
        defs: CellAnimationEvaluationDefs,
        timeline: number,
    ): CellAnimationEvaluationResult =>
        animationRegistry[type](CellAnimationBreakpoints.computeLocalTimeline(breakpoints, timeline), defs);
}
