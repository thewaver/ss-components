import { LabelUtils } from "../Input/Label/Label.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { ButtonElementProps, ButtonProps, ButtonType } from "./Button.types";

import * as styles from "./Button.css";

const DEFAULT_BUTTON_TYPE: ButtonType = "button";

const ButtonElement = (props: ButtonElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type={props.getType?.() ?? DEFAULT_BUTTON_TYPE}
            class={styles.buttonElement}
            aria-label={getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            aria-pressed={props.getFlags().isPressed}
            onClick={(e) => {
                if (getIsDisabled()) return;

                void props.onClick?.(e);
            }}
            onPointerDown={(e) => {
                if (getIsDisabled()) return;

                void props.onPointerDown?.(e);
            }}
            onPointerUp={(e) => {
                if (getIsDisabled()) return;

                void props.onPointerUp?.(e);
            }}
            onPointerCancel={(e) => {
                if (getIsDisabled()) return;

                void props.onPointerUp?.(e);
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
                getAriaLabel={props.getAriaLabel}
                getType={props.getType}
                getId={props.getId}
                getFlags={getFlags}
                renderContent={props.renderContent}
                onClick={props.onClick}
                onPointerDown={props.onPointerDown}
                onPointerUp={props.onPointerUp}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            />
        )}
    />
);
