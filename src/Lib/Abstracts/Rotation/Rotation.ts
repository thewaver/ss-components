import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, on, onCleanup, untrack } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";

import type { EasingFn } from "../../Utils/easing";
import { EasingUtils } from "../../Utils/easing";
import { access } from "../../Utils/propUtils";
import { InteractionUtils } from "../Interaction/Interaction.utils";
import { LiveAnnouncer } from "../LiveAnnouncer/LiveAnnouncer";
import { SignalMirror } from "../SignalMirror/SignalMirror";
import type { RotationDefs, RotationPhase, RotationSpinDefs } from "./Rotation.types";
import { RotationUtils } from "./Rotation.utils";

const DEFAULT_SPIN_DURATION_MS = 3000;
const DEFAULT_SETTLE_DURATION_MS = 1500;
const DEFAULT_REST_DURATION_MS = 3000;
const DEFAULT_SPIN_DEFS: RotationSpinDefs = { turns: 3, jitterRatio: 0 };
const MIN_ROTATABLE_STEP_COUNT = 2;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FRAME_STARVATION_SLACK_MS = 100;
const SPIN_EASING: EasingFn = EasingUtils.ease;

export namespace Rotation {
    export const createRotation = (getIsDisabled: Accessor<boolean>, defs: RotationDefs) => {
        const [getAngle, setAngle] = createSignal(0);
        const [getSpinPhase, setSpinPhase] = createSignal<Exclude<RotationPhase, "idling">>("still");
        const [getIsAwaitingTarget, setIsAwaitingTarget] = createSignal(false);
        const [getPrefersReducedMotion, setPrefersReducedMotion] = createSignal(false);
        const [getIsResting, setIsResting] = createSignal(false);

        const [getIndex, setIndex] = SignalMirror.createOptional(() => defs.indexSignal, 0);
        const [getIsAutoSpinEnabled] = SignalMirror.createOptional(() => defs.autoSpinSignal, true);

        let targetIndex: number | undefined;
        let spinFrameId: number | undefined;
        let starvationHandle: ReturnType<typeof setTimeout> | undefined;

        const getStepCount = createMemo(() => Math.max(0, Math.trunc(access(defs.stepCount))));

        const getStepAngle = createMemo(() => RotationUtils.getStepAngle(getStepCount()));

        const getSpinDurationMs = createMemo(() => access(defs.spinDurationMs) ?? DEFAULT_SPIN_DURATION_MS);

        const getSettleDurationMs = createMemo(() => access(defs.settleDurationMs) ?? DEFAULT_SETTLE_DURATION_MS);

        const getRestDurationMs = createMemo(() => access(defs.restDurationMs) ?? DEFAULT_REST_DURATION_MS);

        const getIdleDelayMs = createMemo(() => access(defs.idleDelayMs));

        const getIsRotatable = createMemo(() => !getIsDisabled() && getStepCount() >= MIN_ROTATABLE_STEP_COUNT);

        const getIsPageHidden = InteractionUtils.trackPageHidden();

        const getIsSpinnable = createMemo(
            () => getIsRotatable() && getSpinPhase() === "still" && !getIsAwaitingTarget(),
        );

        const getPhase = createMemo((): RotationPhase => {
            const spinPhase = getSpinPhase();

            if (spinPhase !== "still") return spinPhase;

            const isIdling =
                getIdleDelayMs() !== undefined &&
                getIsAutoSpinEnabled() &&
                !getIsResting() &&
                !getIsPageHidden() &&
                !getPrefersReducedMotion() &&
                getIsRotatable();

            return isIdling ? "idling" : "still";
        });

        const getSelectedIndex = createMemo(() => RotationUtils.getAngleIndex(getAngle(), getStepCount()));

        const getStepLabel = (index: number) =>
            defs.computeStepLabel?.(index, getStepCount()) ?? `${index + 1} of ${getStepCount()}`;

        const stopSpinFrames = () => {
            if (spinFrameId !== undefined) cancelAnimationFrame(spinFrameId);
            if (starvationHandle !== undefined) clearTimeout(starvationHandle);

            spinFrameId = undefined;
            starvationHandle = undefined;
        };

        const turnTo = (toAngle: number, durationMs: number, easing: EasingFn, onArrival: () => void) => {
            stopSpinFrames();

            const fromAngle = untrack(getAngle);

            const arrive = () => {
                stopSpinFrames();
                setAngle(toAngle);
                onArrival();
            };

            if (durationMs <= 0) {
                arrive();

                return;
            }

            const startedAt = performance.now();

            const advance = () => {
                const ratio = MathUtils.clamp01((performance.now() - startedAt) / durationMs);

                if (ratio >= 1) {
                    arrive();

                    return;
                }

                setAngle(MathUtils.lerp(fromAngle, toAngle, easing(ratio)));

                spinFrameId = requestAnimationFrame(advance);
            };

            starvationHandle = setTimeout(arrive, durationMs + FRAME_STARVATION_SLACK_MS);
            spinFrameId = requestAnimationFrame(advance);
        };

        const settle = () => {
            const index = RotationUtils.wrapIndex(targetIndex ?? getIndex(), getStepCount());

            targetIndex = undefined;

            setSpinPhase("still");
            setIsResting(true);
            setIndex(index);

            void defs.onSpinEnd?.(index);

            LiveAnnouncer.announce(getStepLabel(index));
        };

        const spin = () => {
            if (!getIsSpinnable()) return;

            setIsResting(false);
            setIsAwaitingTarget(true);

            void Promise.resolve(defs.computeSpinTarget())
                .then((index) => {
                    const stepCount = getStepCount();
                    const spinDefs = defs.computeSpinDefs?.(index, stepCount) ?? DEFAULT_SPIN_DEFS;
                    const jitterAngle = RotationUtils.getJitterAngle(spinDefs.jitterRatio, stepCount);
                    const spinAngle =
                        RotationUtils.getSpinAngle(untrack(getAngle), index, stepCount, spinDefs.turns) + jitterAngle;

                    targetIndex = index;

                    setSpinPhase("spinning");
                    setIsAwaitingTarget(false);

                    turnTo(spinAngle, getSpinDurationMs(), SPIN_EASING, () => {
                        if (jitterAngle === 0) {
                            settle();

                            return;
                        }

                        setSpinPhase("settling");

                        turnTo(spinAngle - jitterAngle, getSettleDurationMs(), SPIN_EASING, settle);
                    });
                })
                .catch(() => {
                    setIsAwaitingTarget(false);
                });
        };

        createEffect(() => {
            const query = window.matchMedia(REDUCED_MOTION_QUERY);
            const onChange = () => setPrefersReducedMotion(query.matches);

            onChange();
            query.addEventListener("change", onChange);

            onCleanup(() => {
                query.removeEventListener("change", onChange);
            });
        });

        createEffect(() => {
            const restDurationMs = getRestDurationMs();

            if (!getIsResting() || restDurationMs < 0) return;

            const handle = setTimeout(() => setIsResting(false), restDurationMs);

            onCleanup(() => {
                clearTimeout(handle);
            });
        });

        createEffect(() => {
            const idleDelayMs = getIdleDelayMs();
            const stepAngle = getStepAngle();

            if (getPhase() !== "idling" || idleDelayMs === undefined || idleDelayMs <= 0 || stepAngle <= 0) return;

            const degreesPerMs = stepAngle / idleDelayMs;

            let previousTime = performance.now();
            let idleFrameId: number;

            const advance = (time: number) => {
                const elapsedMs = time - previousTime;

                previousTime = time;

                setAngle((angle) => angle + elapsedMs * degreesPerMs);

                idleFrameId = requestAnimationFrame(advance);
            };

            idleFrameId = requestAnimationFrame(advance);

            onCleanup(() => {
                cancelAnimationFrame(idleFrameId);
            });
        });

        createEffect(on(getSelectedIndex, (index) => defs.onStepChange?.(index), { defer: true }));

        onCleanup(stopSpinFrames);

        return {
            getAngle,
            getIndex,
            getSelectedIndex,
            getPhase,
            getStepAngle,
            getStepCount,
            getIsRotatable,
            getIsSpinnable,
            getIsAwaitingTarget,
            spin,
        };
    };
}
