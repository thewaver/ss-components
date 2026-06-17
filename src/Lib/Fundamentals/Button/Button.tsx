import { createMemo, createSignal } from "solid-js";
import type { ParentProps } from "solid-js";

import { Tooltip } from "../Tooltip/Tooltip";
import type { ButtonProps, ButtonSizing } from "./Button.types";

import * as styles from "./Button.css";

const DEFAULT_BUTTON_SIZING: ButtonSizing = "fit-content";

export const Button = (props: ParentProps<ButtonProps>) => {
    const [getAnchorRef, setAnchorRef] = createSignal<HTMLElement>();

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_BUTTON_SIZING);

    return (
        <div
            class={[styles.buttonRoot, styles.buttonSizingVariants[getSizing()]].join(" ")}
            classList={{
                [styles.buttonError]: props.getHasError?.(),
                [styles.buttonPressed]: props.getIsPressed?.(),
            }}
        >
            <button
                ref={setAnchorRef}
                type="button"
                class={[styles.buttonElement, styles.buttonSizingVariants[getSizing()]].join(" ")}
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
