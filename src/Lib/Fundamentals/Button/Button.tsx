import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { ButtonElementProps, ButtonProps } from "./Button.types";

import * as styles from "./Button.css";

const ButtonElement = (props: ButtonElementProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.buttonElement}
            aria-disabled={getIsDisabled() || undefined}
            aria-pressed={props.getFlags().isPressed}
            onClick={(e) => {
                if (getIsDisabled()) return;

                void props.onClick?.(e);
            }}
            onMouseEnter={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseLeave?.(e);
            }}
        >
            {props.renderContent(props.getFlags)}
        </button>
    );
};

export const Button = (props: ButtonProps) => (
    <InteractionWrapper
        {...props}
        renderControl={(setElementRef, getFlags) => (
            <ButtonElement
                ref={setElementRef}
                getId={props.getId}
                getFlags={getFlags}
                renderContent={props.renderContent}
                onClick={props.onClick}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            />
        )}
    />
);
