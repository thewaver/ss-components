import type { ParentProps } from "solid-js";

import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { ButtonElementProps, ButtonProps } from "./Button.types";

import * as styles from "./Button.css";

const ButtonElement = (props: ParentProps<ButtonElementProps>) => {
    const getIsDisabled = () => props.getFlags?.().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.buttonElement}
            disabled={getIsDisabled() && !(props.getIsReachable?.() ?? false)}
            aria-disabled={getIsDisabled() || undefined}
            aria-pressed={props.getFlags?.().isPressed}
            onClick={(e) => {
                if (getIsDisabled()) return;

                void props.onClick?.(e);
            }}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
        >
            {props.children}
        </button>
    );
};

export const Button = (props: ParentProps<ButtonProps>) => (
    <InteractionWrapper
        {...props}
        renderControl={(setElementRef, getFlags, getIsReachable) => (
            <ButtonElement
                ref={setElementRef}
                getId={props.getId}
                getFlags={getFlags}
                getIsReachable={getIsReachable}
                onClick={props.onClick}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                {props.children}
            </ButtonElement>
        )}
    />
);
