import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { InteractionUtils } from "../Interaction/Interaction.utils";
import { LiveAnnouncer } from "../LiveAnnouncer/LiveAnnouncer";
import { SignalMirror } from "../SignalMirror/SignalMirror";
import type { RotationDefs, RotationPhase, RotationSpinDefs, RotationTimingFunction } from "./Rotation.types";
import { RotationUtils } from "./Rotation.utils";

const DEFAULT_SPIN_DURATION_MS = 3000;
const DEFAULT_SETTLE_DURATION_MS = 1500;
const DEFAULT_REST_DURATION_MS = 3000;
const DEFAULT_SPIN_DEFS: RotationSpinDefs = { turns: 3, jitterRatio: 0 };
const MIN_ROTATABLE_STEP_COUNT = 2;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SETTLED_TIMING_FUNCTION: RotationTimingFunction = "ease";
const IDLING_TIMING_FUNCTION: RotationTimingFunction = "linear";

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
        let jitterAngle = 0;

        const getStepCount = createMemo(() => Math.max(0, Math.trunc(defs.getStepCount())));

        const getStepAngle = createMemo(() => RotationUtils.getStepAngle(getStepCount()));

        const getSpinDurationMs = createMemo(() => defs.getSpinDurationMs?.() ?? DEFAULT_SPIN_DURATION_MS);

        const getSettleDurationMs = createMemo(() => defs.getSettleDurationMs?.() ?? DEFAULT_SETTLE_DURATION_MS);

        const getRestDurationMs = createMemo(() => defs.getRestDurationMs?.() ?? DEFAULT_REST_DURATION_MS);

        const getIdleDelayMs = createMemo(() => defs.getIdleDelayMs?.());

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

        const getTransitionDurationMs = createMemo(() => {
            switch (getPhase()) {
                case "spinning": {
                    return getSpinDurationMs();
                }
                case "settling": {
                    return getSettleDurationMs();
                }
                case "idling": {
                    return getIdleDelayMs() ?? 0;
                }
                case "still": {
                    return 0;
                }
            }
        });

        const getTimingFunction = createMemo(() =>
            getPhase() === "idling" ? IDLING_TIMING_FUNCTION : SETTLED_TIMING_FUNCTION,
        );

        const getStepLabel = (index: number) =>
            defs.computeStepLabel?.(index, getStepCount()) ?? `${index + 1} of ${getStepCount()}`;

        const settle = () => {
            const index = RotationUtils.wrapIndex(targetIndex ?? getIndex(), getStepCount());

            targetIndex = undefined;
            jitterAngle = 0;

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

                    jitterAngle = RotationUtils.getJitterAngle(spinDefs.jitterRatio, stepCount);
                    targetIndex = index;

                    setAngle(
                        (prev) => RotationUtils.getSpinAngle(prev, index, stepCount, spinDefs.turns) + jitterAngle,
                    );
                    setSpinPhase("spinning");
                    setIsAwaitingTarget(false);
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
            const spinPhase = getSpinPhase();

            if (spinPhase === "still") return;

            const durationMs = spinPhase === "spinning" ? getSpinDurationMs() : getSettleDurationMs();
            const handle = setTimeout(() => {
                if (spinPhase === "spinning" && jitterAngle !== 0) {
                    setAngle((prev) => prev - jitterAngle);
                    setSpinPhase("settling");

                    return;
                }

                settle();
            }, durationMs);

            onCleanup(() => {
                clearTimeout(handle);
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
            if (getPhase() !== "idling") return;

            const fromAngle = getAngle();
            const stepAngle = getStepAngle();
            const handle = setTimeout(() => setAngle(fromAngle + stepAngle), getIdleDelayMs());

            onCleanup(() => {
                clearTimeout(handle);
            });
        });

        return {
            getAngle,
            getIndex,
            getPhase,
            getStepAngle,
            getStepCount,
            getTransitionDurationMs,
            getTimingFunction,
            getIsRotatable,
            getIsSpinnable,
            getIsAwaitingTarget,
            spin,
        };
    };
}
