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

        onCleanup(() => {
            clearTimeout(transitionTimeout);
        });

        const [getTransitionTarget, setTransitionTarget] = createSignal<0 | 1>(0);
        const [getHasTransitionFinished, setHasTransitionFinished] = createSignal(true);

        const getIsVisibleOrTransitioning = createMemo(() => {
            const transitionTarget = getTransitionTarget();
            const hasTransitionFinished = getHasTransitionFinished();

            return transitionTarget === 1 || !hasTransitionFinished;
        });

        const show = () => {
            if (getTransitionTarget() === 1) return;

            setHasTransitionFinished(false);
            setTimeout(() => {
                setTransitionTarget(1);
                clearTimeout(transitionTimeout);
                transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
            }, 0);

            opts?.onShow?.();
        };

        const hide = () => {
            if (getTransitionTarget() === 0) return;

            setHasTransitionFinished(false);
            setTimeout(() => {
                setTransitionTarget(0);
                clearTimeout(transitionTimeout);
                transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
            }, 0);

            opts?.onHide?.();
        };

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
            show,
            hide,
        };
    };
}
