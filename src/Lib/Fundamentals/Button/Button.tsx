import { ParentProps, Show, createMemo } from "solid-js";

import { ButtonProps } from "./Button.types";

import * as styles from "./Button.css";

export const Button = (props: ParentProps<ButtonProps>) => {
    let anchorRect: HTMLDivElement | undefined;

    const getFlags = createMemo(() => {
        return {
            isSelectible: true,
            isSelected: props.getIsSelected?.(),
            isDisabled: props.getIsDisabled?.(),
            hasError: props.getHasError?.(),
        };
    });

    return (
        <div class={styles.buttonRoot}>
            <button
                ref={(el) => {
                    anchorRect = el as any;
                }}
                type="button"
                class={`${styles.buttonElement} ${props.getClassName?.()}`}
                classList={{
                    [styles.buttonError]: props.getHasError?.(),
                    [styles.buttonSelected]: props.getIsSelected?.(),
                }}
                disabled={props.getIsDisabled?.()}
                onClick={props.onClick}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                {props.children}
            </button>

            <Show when={props.renderCorners}>
                <div class={styles.buttonCornersWrapper}>{props.renderCorners?.(getFlags())}</div>
            </Show>

            <Show when={props.renderTooltip}>{props.renderTooltip?.(anchorRect, getFlags())}</Show>
        </div>
    );
};
