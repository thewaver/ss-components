import { createSignal } from "solid-js";
import type { ParentProps } from "solid-js";

import { Tooltip } from "../Tooltip/Tooltip";
import type { ButtonProps } from "./Button.types";

import * as styles from "./Button.css";

export const Button = (props: ParentProps<ButtonProps>) => {
    const [getAnchorRef, setAnchorRef] = createSignal<HTMLElement>();

    return (
        <div
            class={styles.buttonRoot}
            classList={{
                [styles.buttonError]: props.getHasError?.(),
                [styles.buttonPressed]: props.getIsPressed?.(),
            }}
        >
            <button
                ref={setAnchorRef}
                type="button"
                class={`${styles.buttonElement} ${props.getClassName?.()}`}
                disabled={props.getIsDisabled?.()}
                aria-pressed={props.getIsPressed?.()}
                onClick={props.onClick}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                {props.children}
            </button>

            {props.renderHighlight && <div class={styles.buttonCornersWrapper}>{props.renderHighlight()}</div>}

            {props.getTooltipDefs && <Tooltip {...props.getTooltipDefs()} getAnchorRef={getAnchorRef} />}
        </div>
    );
};
