import { MathUtils } from "@thewaver/ss-utils";

const MAX_JITTER_RATIO = 0.5;
const MIN_SPIN_TURNS = 1;

export namespace RotationUtils {
    export const wrapIndex = (index: number, stepCount: number) => {
        if (stepCount < 1) return 0;

        return ((Math.trunc(index) % stepCount) + stepCount) % stepCount;
    };

    export const getStepAngle = (stepCount: number) => (stepCount > 0 ? 360 / stepCount : 0);

    export const getIndexAngle = (index: number, stepCount: number) => {
        if (stepCount < 1) return 0;

        return (360 - getStepAngle(stepCount) * wrapIndex(index, stepCount)) % 360;
    };

    export const getAngleIndex = (angle: number, stepCount: number) => {
        if (stepCount < 1) return 0;

        return wrapIndex(Math.round(-angle / getStepAngle(stepCount)), stepCount);
    };

    export const getSpinAngle = (fromAngle: number, index: number, stepCount: number, turns: number) => {
        const wholeTurns = Math.ceil(fromAngle / 360);
        const extraTurns = Math.max(MIN_SPIN_TURNS, Math.trunc(turns));

        return (wholeTurns + extraTurns) * 360 + getIndexAngle(index, stepCount);
    };

    export const getJitterAngle = (jitterRatio: number, stepCount: number) =>
        getStepAngle(stepCount) * MathUtils.clamp(jitterRatio, -MAX_JITTER_RATIO, MAX_JITTER_RATIO);
}
