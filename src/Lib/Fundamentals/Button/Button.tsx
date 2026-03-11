import { ParentProps, Show } from "solid-js";

import { Tooltip } from "../Tooltip/Tooltip";
import { ButtonProps } from "./Button.types";

import * as styles from "./Button.css";

export const Button = (props: ParentProps<ButtonProps>) => {
    let anchorRef: HTMLDivElement | undefined;

    return (
        <div class={styles.buttonRoot}>
            <button
                ref={(el) => {
                    anchorRef = el as any;
                }}
                type="button"
                class={`${styles.buttonElement} ${props.getClassName?.()}`}
                classList={{
                    [styles.buttonError]: props.getHasError?.(),
                    [styles.buttonSelected]: props.getIsSelected?.(),
                }}
                disabled={props.getIsDisabled?.()}
                aria-selected={props.getIsSelected?.()}
                onClick={props.onClick}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                {props.children}
            </button>

            <Show when={props.renderCorners}>
                <div class={styles.buttonCornersWrapper}>{props.renderCorners!()}</div>
            </Show>

            <Show when={props.getTooltipDefs}>
                <Tooltip {...props.getTooltipDefs!()} anchorRef={anchorRef} />
            </Show>
        </div>
    );
};
