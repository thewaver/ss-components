import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { InternalInteractionFlags } from "./Interaction.types";

export namespace InteractionUtils {
    export const computeIsReachable = (isDisabled: boolean, isReachableWhenDisabled: boolean, hasTooltip: boolean) =>
        isDisabled && isReachableWhenDisabled && hasTooltip;

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
}
