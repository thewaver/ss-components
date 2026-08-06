import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

const FRAME_FALLBACK_MS = 100;

export namespace ElementFader {
    export const createFader = (
        getIsVisible: () => boolean,
        opts: {
            getTransitionDurationMs: () => number;
            onShow?: () => void;
            onHide?: () => void;
        },
    ) => {
        let transitionTimeout: ReturnType<typeof setTimeout> | undefined;
        let pendingFrameId: number | undefined;
        let pendingFallbackTimeout: ReturnType<typeof setTimeout> | undefined;
        let pendingTarget: 0 | 1 = 0;

        const clearPending = () => {
            if (pendingFrameId !== undefined) {
                cancelAnimationFrame(pendingFrameId);
            }
            clearTimeout(pendingFallbackTimeout);

            pendingFrameId = undefined;
            pendingFallbackTimeout = undefined;
        };

        onCleanup(() => {
            clearPending();
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
            if (pendingTarget === target) return;

            pendingTarget = target;

            setHasTransitionFinished(false);

            clearPending();

            const commit = () => {
                clearPending();

                setTransitionTarget(target);
                clearTimeout(transitionTimeout);
                transitionTimeout = setTimeout(() => setHasTransitionFinished(true), opts.getTransitionDurationMs());
            };

            pendingFrameId = requestAnimationFrame(commit);
            pendingFallbackTimeout = setTimeout(commit, FRAME_FALLBACK_MS);

            (target === 1 ? opts.onShow : opts.onHide)?.();
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
