import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { InternalInteractionFlags } from "./Interaction.types";

export namespace InteractionUtils {
    export const wrapElement = (getRef: () => HTMLElement | undefined, getIsDisabled: () => boolean) => {
        const [internalFlags, setInternalFlags] = createStore<InternalInteractionFlags>({});
        const [getActiveByMouse, setActiveByMouse] = createSignal(false);
        const [getActiveByKey, setActiveByKey] = createSignal(false);

        const getFlags = createMemo(() => {
            const flags: InternalInteractionFlags = {
                ...internalFlags,
                isActive: getActiveByMouse() || getActiveByKey(),
            };

            return flags;
        });

        const getTabIndex = createMemo(() => (!getIsDisabled?.() ? 0 : -1));

        const onFocus = () => {
            setInternalFlags("isFocused", true);
        };

        const onBlur = () => {
            setInternalFlags("isFocused", false);
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
            setActiveByKey(true);
        };

        const onKeyUp = () => {
            setActiveByKey(false);
        };

        createEffect(() => {
            const ref = getRef();
            const isDisabled = getIsDisabled();

            if (!ref || isDisabled) return;

            ref.role = "button";
            ref.tabIndex = getTabIndex();
            ref.style.cursor = "pointer";

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
