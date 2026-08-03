import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

export namespace ElementFader {
    export const createFader = (
        getIsVisible: () => boolean,
        getTransitionDurationMs: () => number,
        opts?: {
            onShow?: () => void;
            onHide?: () => void;
        },
    ) => {
        let transitionTimeout: ReturnType<typeof setTimeout> | undefined;
        let pendingFrameId: number | undefined;

        onCleanup(() => {
            if (pendingFrameId !== undefined) {
                cancelAnimationFrame(pendingFrameId);
            }
            clearTimeout(transitionTimeout);
        });

        const [getTransitionTarget, setTransitionTarget] = createSignal<0 | 1>(0);
        const [getHasTransitionFinished, setHasTransitionFinished] = createSignal(true);

        const getIsVisibleOrTransitioning = createMemo(() => {
            const transitionTarget = getTransitionTarget();
            const hasTransitionFinished = getHasTransitionFinished();

            return transitionTarget === 1 || !hasTransitionFinished;
        });

        const setTarget = (target: 0 | 1) => {
            if (getTransitionTarget() === target) return;

            setHasTransitionFinished(false);

            if (pendingFrameId !== undefined) cancelAnimationFrame(pendingFrameId);

            pendingFrameId = requestAnimationFrame(() => {
                pendingFrameId = undefined;

                setTransitionTarget(target);
                clearTimeout(transitionTimeout);
                transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
            });

            (target === 1 ? opts?.onShow : opts?.onHide)?.();
        };

        const show = () => setTarget(1);

        const hide = () => setTarget(0);

        createEffect(() => {
            const isVisible = getIsVisible();

            if (isVisible) {
                show();
            } else {
                hide();
            }
        });

        return {
            getIsVisible: getIsVisibleOrTransitioning,
            getTransitionTarget,
            getHasTransitionFinished,
            show,
            hide,
        };
    };
}
