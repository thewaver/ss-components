import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { InteractionDragRatio, InternalInteractionFlags } from "./Interaction.types";

const RATIO_MIN = 0;
const RATIO_MAX = 1;

const computeRatio = (element: HTMLElement, clientX: number, clientY: number): InteractionDragRatio => {
    const rect = element.getBoundingClientRect();

    return {
        x: Math.min(Math.max(rect.width > 0 ? (clientX - rect.left) / rect.width : 0, RATIO_MIN), RATIO_MAX),
        y: Math.min(Math.max(rect.height > 0 ? (clientY - rect.top) / rect.height : 0, RATIO_MIN), RATIO_MAX),
    };
};

export namespace InteractionUtils {
    export const computeIsReachable = (isDisabled: boolean, isReachableWhenDisabled: boolean, hasTooltip: boolean) =>
        isDisabled && isReachableWhenDisabled && hasTooltip;

    /**
     * `wrapElement` acts on the one element `InteractionWrapper` was handed, so a leaf that renders several
     * focusable elements — a two-thumb `Range`, a `ColorArea`'s two axis sliders — leaves the rest of them
     * with a native `tabIndex` of 0 and no focus refusal, tab-reachable while the control is disabled. This
     * gives those the disabled half of the same treatment.
     *
     * Reachability deliberately does not enter into it. A control that is reachable while disabled is
     * focusable so that its tooltip can be read, and the tooltip is anchored on the wrapper's single
     * element — one target reveals it, so the extra elements leave the tab order whenever the control is
     * disabled, reachable or not. That also keeps this from re-exposing reachability to a leaf, which the
     * wrapper split deliberately stopped.
     */
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

    export const trackDrag = (
        getRef: () => HTMLElement | undefined,
        getIsDisabled: () => boolean,
        opts: {
            onDrag: (ratio: InteractionDragRatio) => void;
            onDragEnd?: () => void;
        },
    ) => {
        const [getIsDragging, setIsDragging] = createSignal(false);

        createEffect(() => {
            const ref = getRef();

            if (!ref || getIsDisabled()) {
                setIsDragging(false);

                return;
            }

            const report = (e: PointerEvent) => {
                opts.onDrag(computeRatio(ref, e.clientX, e.clientY));
            };

            const onPointerDown = (e: PointerEvent) => {
                if (e.button !== 0) return;

                e.preventDefault();

                ref.setPointerCapture(e.pointerId);
                setIsDragging(true);
                report(e);
            };

            const onPointerMove = (e: PointerEvent) => {
                if (!ref.hasPointerCapture(e.pointerId)) return;

                report(e);
            };

            const onPointerUp = (e: PointerEvent) => {
                if (!ref.hasPointerCapture(e.pointerId)) return;

                ref.releasePointerCapture(e.pointerId);
                setIsDragging(false);
                opts.onDragEnd?.();
            };

            ref.addEventListener("pointerdown", onPointerDown);
            ref.addEventListener("pointermove", onPointerMove);
            ref.addEventListener("pointerup", onPointerUp);
            ref.addEventListener("pointercancel", onPointerUp);

            onCleanup(() => {
                ref.removeEventListener("pointerdown", onPointerDown);
                ref.removeEventListener("pointermove", onPointerMove);
                ref.removeEventListener("pointerup", onPointerUp);
                ref.removeEventListener("pointercancel", onPointerUp);
            });
        });

        return { getIsDragging };
    };
}
