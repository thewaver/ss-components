import { type CSSAnimationKey, MathUtils, Matrix3dUtils, type Point3d } from "@thewaver/ss-utils";

import { CellAnimationZones } from "../CellAnimationZones/CellAnimationZones.const";
import type {
    CellAnimationFn,
    CellStop,
    CellStopTrack,
    CompiledCellStops,
    _CellZone,
} from "./CellAnimationKeyframes.types";

export namespace CellAnimationKeyframeUtils {
    const RESULT_DECIMAL_PLACES = 3;

    export const compileStops = (stops: CellStop[]): CompiledCellStops => {
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

    export const sampleTrack = (track: CellStopTrack, timeline: number) => {
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

    export const fromStops = (stops: CellStop[]): CellAnimationFn => {
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
            const anchor: Point3d = {
                x: ((originX ?? 0.5) - 0.5) * width,
                y: ((originY ?? 0.5) - 0.5) * height,
                z: 0,
            };
            const offset: Point3d = { x: 0, y: 0, z: ((depth ?? 0) * Math.max(width, height)) / 100 };
            const matrix = Matrix3dUtils.multiply(
                Matrix3dUtils.multiply(
                    Matrix3dUtils.multiply(
                        Matrix3dUtils.rotationZ(result.rotate ?? 0),
                        Matrix3dUtils.rotationX(result.rotateX ?? 0),
                    ),
                    Matrix3dUtils.rotationY(result.rotateY ?? 0),
                ),
                Matrix3dUtils.scaling((result.scaleX ?? 100) / 100, (result.scaleY ?? 100) / 100),
            );
            const rotatedAnchor = Matrix3dUtils.apply(matrix, anchor);
            const rotatedOffset = Matrix3dUtils.apply(matrix, offset);
            const translation: Point3d = {
                x: anchor.x - rotatedAnchor.x + rotatedOffset.x,
                y: anchor.y - rotatedAnchor.y + rotatedOffset.y,
                z: anchor.z - rotatedAnchor.z + rotatedOffset.z,
            };

            result.translateX = MathUtils.roundToDecimalPlaces(
                (result.translateX ?? 0) + (width > 0 ? (translation.x / width) * 100 : 0),
                RESULT_DECIMAL_PLACES,
            );
            result.translateY = MathUtils.roundToDecimalPlaces(
                (result.translateY ?? 0) + (height > 0 ? (translation.y / height) * 100 : 0),
                RESULT_DECIMAL_PLACES,
            );

            if (translation.z !== 0 || result.translateZ !== undefined) {
                result.translateZ = MathUtils.roundToDecimalPlaces(
                    (result.translateZ ?? 0) + translation.z,
                    RESULT_DECIMAL_PLACES,
                );
            }

            return result;
        };
    };

    export const _fromZones =
        (zones: _CellZone[], fallback: CellAnimationFn): CellAnimationFn =>
        (timeline, defs) => {
            for (const { zone, animation } of zones) {
                if (CellAnimationZones.isInZone(zone, defs)) return animation(timeline, defs);
            }

            return fallback(timeline, defs);
        };
}
