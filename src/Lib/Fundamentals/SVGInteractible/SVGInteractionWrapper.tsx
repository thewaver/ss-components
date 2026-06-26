import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { ButtonFlags, InternalButtonFlags } from "../Button/Button.types";
import type { SVGInteractionWrapperProps } from "./SVGInteractionWrapper.types";

import * as styles from "./SVGInteractionWrapper.css";

export const SVGInteractionWrapper = (props: SVGInteractionWrapperProps) => {
    const [internalFlags, setInternalFlags] = createStore<InternalButtonFlags>({});
    const [getActiveByMouse, setActiveByMouse] = createSignal(false);
    const [getActiveByKey, setActiveByKey] = createSignal(false);

    const getFlags = createMemo(
        (): ButtonFlags => ({
            ...internalFlags,
            isActive: getActiveByMouse() || getActiveByKey(),
            isDisabled: props.getIsDisabled?.(),
            isPressed: props.getIsPressed?.(),
            hasError: props.getHasError?.(),
        }),
    );

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    return (
        <g
            class={styles.svgInteractionWrapperRoot}
            role="button"
            tabIndex={getTabIndex()}
            aria-disabled={props.getIsDisabled?.()}
            aria-pressed={props.getIsPressed?.()}
            onClick={!props.getIsDisabled?.() ? props.onClick : undefined}
            onFocus={() => {
                setInternalFlags("isFocused", true);
            }}
            onBlur={() => {
                setInternalFlags("isFocused", false);
            }}
            onMouseEnter={(e) => {
                props.onMouseEnter?.(e);
                setInternalFlags("isHovered", true);
            }}
            onMouseLeave={(e) => {
                props.onMouseLeave?.(e);
                setInternalFlags("isHovered", false);
            }}
            onMouseDown={(e) => {
                if (props.getIsDisabled?.()) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    setActiveByMouse(true);
                }
            }}
            onMouseUp={(e) => {
                if (props.getIsDisabled?.()) {
                    setActiveByMouse(false);
                }
            }}
            onKeyDown={async (e) => {
                if (props.getIsDisabled?.()) {
                    e.preventDefault();
                    e.stopPropagation();
                } else if (e.key === "Enter" || e.key === " ") {
                    if (e.key === " ") {
                        e.preventDefault();
                    }
                    setActiveByKey(true);

                    await props.onClick?.(e);
                }
            }}
            onKeyUp={() => {
                setActiveByKey(false);
            }}
        >
            {props.renderChildren(getFlags)}
        </g>
    );
};
