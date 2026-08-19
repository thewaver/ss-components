import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import { MathUtils } from "@thewaver/ss-utils";

import type {
    InteractionDragEndReason,
    InteractionDragRatio,
    InteractionSwipeAxis,
    InteractionSwipeDirection,
    InternalInteractionFlags,
} from "./Interaction.types";

const SWIPE_SLOP_RATIO = 0.02;
const SCROLL_EDGE_PX = 1;
const SWIPE_TOUCH_ACTIONS: Record<InteractionSwipeAxis, string> = {
    horizontal: "pan-y",
    vertical: "pan-x",
};

const getHasLeft = (event: FocusEvent) => {
    const target = event.relatedTarget;

    return !(target instanceof Node) || !(event.currentTarget as HTMLElement).contains(target);
};

const computeRatio = (rect: DOMRect, clientX: number, clientY: number): InteractionDragRatio => {
    return {
        x: MathUtils.normalize(clientX, rect.left, rect.right),
        y: MathUtils.normalize(clientY, rect.top, rect.bottom),
    };
};

const getHasScrollRoom = (element: Element, axis: InteractionSwipeAxis, delta: number) => {
    const position = axis === "horizontal" ? element.scrollLeft : element.scrollTop;
    const extent =
        axis === "horizontal" ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;

    return delta > 0 ? position > SCROLL_EDGE_PX : position < extent - SCROLL_EDGE_PX;
};

const getHasScrollChainRoom = (
    target: EventTarget | null,
    root: HTMLElement,
    axis: InteractionSwipeAxis,
    delta: number,
) => {
    let node = target instanceof Element ? target : null;

    while (node) {
        if (getHasScrollRoom(node, axis, delta)) return true;
        if (node === root) return false;

        node = node.parentElement;
    }

    return false;
};

const clampRatio = (ratio: InteractionDragRatio): InteractionDragRatio => ({
    x: MathUtils.clamp01(ratio.x),
    y: MathUtils.clamp01(ratio.y),
});

const trackPointer = (
    getRef: () => HTMLElement | undefined,
    getIsDisabled: () => boolean,
    opts: {
        isMeasuredFromStart?: boolean;
        onDown: (ratio: InteractionDragRatio, engage: () => void) => void;
        onMove: (ratio: InteractionDragRatio, engage: () => void) => void;
        onEnd: (reason: InteractionDragEndReason) => void;
    },
) => {
    const [getIsEngaged, setIsEngaged] = createSignal(false);

    let pointerId: number | undefined;
    let startRect: DOMRect | undefined;

    createEffect(() => {
        const ref = getRef();

        if (!ref || getIsDisabled()) {
            pointerId = undefined;
            startRect = undefined;

            setIsEngaged(false);

            return;
        }

        const measure = () => (opts.isMeasuredFromStart && startRect ? startRect : ref.getBoundingClientRect());

        const engage = () => {
            if (pointerId === undefined) return;

            ref.setPointerCapture(pointerId);
            setIsEngaged(true);
        };

        const onPointerDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            if (pointerId !== undefined) return;

            pointerId = e.pointerId;
            startRect = ref.getBoundingClientRect();

            opts.onDown(computeRatio(startRect, e.clientX, e.clientY), engage);

            if (getIsEngaged()) e.preventDefault();
        };

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;

            opts.onMove(computeRatio(measure(), e.clientX, e.clientY), engage);

            if (getIsEngaged()) e.preventDefault();
        };

        const onPointerEnd = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return;

            const wasEngaged = getIsEngaged();

            if (ref.hasPointerCapture(e.pointerId)) ref.releasePointerCapture(e.pointerId);

            pointerId = undefined;
            startRect = undefined;

            setIsEngaged(false);

            if (wasEngaged) opts.onEnd(e.type === "pointercancel" ? "cancel" : "release");
        };

        ref.addEventListener("pointerdown", onPointerDown);
        ref.addEventListener("pointermove", onPointerMove);
        ref.addEventListener("pointerup", onPointerEnd);
        ref.addEventListener("pointercancel", onPointerEnd);

        onCleanup(() => {
            ref.removeEventListener("pointerdown", onPointerDown);
            ref.removeEventListener("pointermove", onPointerMove);
            ref.removeEventListener("pointerup", onPointerEnd);
            ref.removeEventListener("pointercancel", onPointerEnd);
        });
    });

    return { getIsEngaged };
};

export namespace InteractionUtils {
    export const computeIsReachable = (isDisabled: boolean, isReachableWhenDisabled: boolean, hasTooltip: boolean) =>
        isDisabled && isReachableWhenDisabled && hasTooltip;

    export const wrapExtraControls = (
        getRefs: () => Array<HTMLElement | undefined>,
        getIsDisabled: () => boolean,
        opts?: { getIsTabbable?: () => boolean },
    ) => {
        const onDisabledMouseDown = (e: MouseEvent) => {
            e.preventDefault();
        };

        createEffect(() => {
            const isDisabled = getIsDisabled();
            const isTabbable = opts?.getIsTabbable?.() ?? true;

            for (const ref of getRefs()) {
                if (!ref) continue;

                ref.tabIndex = !isDisabled && isTabbable ? 0 : -1;

                if (!isDisabled) continue;

                ref.addEventListener("mousedown", onDisabledMouseDown);

                onCleanup(() => {
                    ref.removeEventListener("mousedown", onDisabledMouseDown);
                });
            }
        });
    };

    export const wrapElement = (
        getRef: () => HTMLElement | undefined,
        getIsDisabled: () => boolean,
        opts?: {
            applyButtonSemantics?: boolean;
            getIsReachable?: () => boolean;
            getIsTabbable?: () => boolean;
        },
    ) => {
        const [internalFlags, setInternalFlags] = createStore<InternalInteractionFlags>({});
        const [getActiveByMouse, setActiveByMouse] = createSignal(false);
        const [getActiveByKey, setActiveByKey] = createSignal(false);

        const getFlags = createMemo(() => {
            const isDisabled = getIsDisabled();

            const flags: InternalInteractionFlags = {
                ...internalFlags,
                isHovered: !isDisabled && (internalFlags.isHovered ?? false),
                isActive: !isDisabled && (getActiveByMouse() || getActiveByKey()),
            };

            return flags;
        });

        const onFocus = () => {
            setInternalFlags("isFocused", true);
        };

        const onBlur = () => {
            setInternalFlags("isFocused", false);
            setActiveByKey(false);
        };

        const onMouseEnter = () => {
            setInternalFlags("isHovered", true);
        };

        const onMouseLeave = () => {
            setInternalFlags("isHovered", false);
            setActiveByMouse(false);
        };

        const onMouseDown = () => {
            setActiveByMouse(true);
        };

        const onMouseUp = () => {
            setActiveByMouse(false);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") return;

            setActiveByKey(true);
        };

        const onKeyUp = () => {
            setActiveByKey(false);
        };

        const onDisabledMouseDown = (e: MouseEvent) => {
            e.preventDefault();
        };

        createEffect(() => {
            const ref = getRef();
            const isDisabled = getIsDisabled();
            const isReachable = opts?.getIsReachable?.() ?? false;
            const isTabbable = opts?.getIsTabbable?.() ?? true;

            if (!ref) return;

            ref.tabIndex = (!isDisabled || isReachable) && isTabbable ? 0 : -1;

            if (opts?.applyButtonSemantics) {
                ref.role = "button";
                ref.ariaDisabled = String(isDisabled);
                ref.style.cursor = !isDisabled ? "pointer" : "not-allowed";
            }

            if (isDisabled && !isReachable) {
                setInternalFlags({ isHovered: false, isFocused: false });
                setActiveByKey(false);
                setActiveByMouse(false);

                ref.addEventListener("mousedown", onDisabledMouseDown);

                onCleanup(() => {
                    ref.removeEventListener("mousedown", onDisabledMouseDown);
                });

                return;
            }

            ref.addEventListener("focus", onFocus);
            ref.addEventListener("blur", onBlur);
            ref.addEventListener("mouseenter", onMouseEnter);
            ref.addEventListener("mouseleave", onMouseLeave);
            ref.addEventListener("mousedown", onMouseDown);
            ref.addEventListener("mouseup", onMouseUp);
            ref.addEventListener("keydown", onKeyDown);
            ref.addEventListener("keyup", onKeyUp);

            onCleanup(() => {
                ref.removeEventListener("focus", onFocus);
                ref.removeEventListener("blur", onBlur);
                ref.removeEventListener("mouseenter", onMouseEnter);
                ref.removeEventListener("mouseleave", onMouseLeave);
                ref.removeEventListener("mousedown", onMouseDown);
                ref.removeEventListener("mouseup", onMouseUp);
                ref.removeEventListener("keydown", onKeyDown);
                ref.removeEventListener("keyup", onKeyUp);
            });
        });

        return { getFlags };
    };

    export const trackPageHidden = () => {
        const [getIsPageHidden, setIsPageHidden] = createSignal(document.hidden);

        const onVisibilityChange = () => setIsPageHidden(document.hidden);

        createEffect(() => {
            document.addEventListener("visibilitychange", onVisibilityChange);

            onCleanup(() => {
                document.removeEventListener("visibilitychange", onVisibilityChange);
            });
        });

        return getIsPageHidden;
    };

    export const trackHold = (getRef: () => HTMLElement | undefined) => {
        const [getIsHovered, setIsHovered] = createSignal(false);
        const [getHasFocusWithin, setHasFocusWithin] = createSignal(false);

        const getIsPageHidden = trackPageHidden();

        const onMouseEnter = () => setIsHovered(true);
        const onMouseLeave = () => setIsHovered(false);
        const onFocusIn = () => setHasFocusWithin(true);
        const onFocusOut = (event: FocusEvent) => {
            if (!getHasLeft(event)) return;

            setHasFocusWithin(false);
        };

        createEffect(() => {
            const ref = getRef();

            if (!ref) return;

            ref.addEventListener("mouseenter", onMouseEnter);
            ref.addEventListener("mouseleave", onMouseLeave);
            ref.addEventListener("focusin", onFocusIn);
            ref.addEventListener("focusout", onFocusOut);

            onCleanup(() => {
                ref.removeEventListener("mouseenter", onMouseEnter);
                ref.removeEventListener("mouseleave", onMouseLeave);
                ref.removeEventListener("focusin", onFocusIn);
                ref.removeEventListener("focusout", onFocusOut);
            });
        });

        return createMemo(() => getIsHovered() || getHasFocusWithin() || getIsPageHidden());
    };

    export const computeSwipeAxis = (direction: InteractionSwipeDirection): InteractionSwipeAxis =>
        direction === "left" || direction === "right" ? "horizontal" : "vertical";

    export const computeSwipeProgress = (
        origin: InteractionDragRatio,
        current: InteractionDragRatio,
        axis: InteractionSwipeAxis,
    ) => (axis === "horizontal" ? current.x - origin.x : current.y - origin.y);

    export const computeSwipeDirection = (
        progressRatio: number,
        axis: InteractionSwipeAxis,
        commitRatio: number,
    ): InteractionSwipeDirection | undefined => {
        if (Math.abs(progressRatio) < commitRatio) return undefined;

        if (axis === "horizontal") return progressRatio > 0 ? "right" : "left";

        return progressRatio > 0 ? "down" : "up";
    };

    export const computeSwipeOffset = (progressRatio: number, direction: InteractionSwipeDirection) =>
        MathUtils.clamp01(direction === "left" || direction === "up" ? -progressRatio : progressRatio);

    export const trackDrag = (
        getRef: () => HTMLElement | undefined,
        getIsDisabled: () => boolean,
        opts: {
            onDrag: (ratio: InteractionDragRatio) => void;
            onDragEnd?: (reason: InteractionDragEndReason) => void;
        },
    ) => {
        const { getIsEngaged } = trackPointer(getRef, getIsDisabled, {
            onDown: (ratio, engage) => {
                engage();
                opts.onDrag(clampRatio(ratio));
            },
            onMove: (ratio) => {
                opts.onDrag(clampRatio(ratio));
            },
            onEnd: (reason) => {
                opts.onDragEnd?.(reason);
            },
        });

        return { getIsDragging: getIsEngaged };
    };

    export const trackSwipe = (
        getRef: () => HTMLElement | undefined,
        getIsDisabled: () => boolean,
        opts: {
            getAxis: () => InteractionSwipeAxis;
            getCommitRatio: () => number;
            onSwipe: (progressRatio: number) => void;
            onSwipeEnd: (direction: InteractionSwipeDirection | undefined) => void;
        },
    ) => {
        let origin: InteractionDragRatio | undefined;
        let progressRatio = 0;
        let hasPendingClick = false;

        const { getIsEngaged } = trackPointer(getRef, getIsDisabled, {
            isMeasuredFromStart: true,
            onDown: (ratio) => {
                origin = ratio;
                progressRatio = 0;
                hasPendingClick = false;
            },
            onMove: (ratio, engage) => {
                if (!origin) return;

                progressRatio = computeSwipeProgress(origin, ratio, opts.getAxis());

                if (!getIsEngaged()) {
                    if (Math.abs(progressRatio) < SWIPE_SLOP_RATIO) return;

                    engage();
                }

                opts.onSwipe(progressRatio);
            },
            onEnd: (reason) => {
                const direction =
                    reason === "cancel"
                        ? undefined
                        : computeSwipeDirection(progressRatio, opts.getAxis(), opts.getCommitRatio());

                origin = undefined;
                progressRatio = 0;
                hasPendingClick = true;

                opts.onSwipeEnd(direction);
            },
        });

        createEffect(() => {
            const ref = getRef();

            if (!ref) return;

            ref.style.touchAction = getIsDisabled() ? "" : SWIPE_TOUCH_ACTIONS[opts.getAxis()];
        });

        createEffect(() => {
            const ref = getRef();

            if (!ref || getIsDisabled()) return;

            let startTouch: { clientX: number; clientY: number } | undefined;
            let isOwned: boolean | undefined;

            const onTouchStart = (e: TouchEvent) => {
                const touch = e.touches[0];

                startTouch = touch && { clientX: touch.clientX, clientY: touch.clientY };
                isOwned = undefined;
            };

            const onTouchMove = (e: TouchEvent) => {
                const touch = e.touches[0];

                if (isOwned === undefined) {
                    if (!startTouch || !touch) return;

                    const axis = opts.getAxis();
                    const delta =
                        axis === "horizontal" ? touch.clientX - startTouch.clientX : touch.clientY - startTouch.clientY;

                    if (delta === 0) return;

                    isOwned = !getHasScrollChainRoom(e.target, ref, axis, delta);
                }

                if (isOwned && e.cancelable) e.preventDefault();
            };

            const onTouchEnd = () => {
                startTouch = undefined;
                isOwned = undefined;
            };

            ref.addEventListener("touchstart", onTouchStart, { passive: true });
            ref.addEventListener("touchmove", onTouchMove, { passive: false });
            ref.addEventListener("touchend", onTouchEnd, { passive: true });
            ref.addEventListener("touchcancel", onTouchEnd, { passive: true });

            onCleanup(() => {
                ref.removeEventListener("touchstart", onTouchStart);
                ref.removeEventListener("touchmove", onTouchMove);
                ref.removeEventListener("touchend", onTouchEnd);
                ref.removeEventListener("touchcancel", onTouchEnd);
            });
        });

        createEffect(() => {
            const ref = getRef();

            if (!ref) return;

            const onClick = (e: MouseEvent) => {
                if (!hasPendingClick) return;

                hasPendingClick = false;

                e.preventDefault();
                e.stopPropagation();
            };

            ref.addEventListener("click", onClick, true);

            onCleanup(() => {
                ref.removeEventListener("click", onClick, true);
            });
        });

        return { getIsSwiping: getIsEngaged };
    };
}
