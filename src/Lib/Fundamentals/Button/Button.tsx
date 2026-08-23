import { access } from "../../Utils/propUtils";
import { LabelUtils } from "../Input/Label/Label.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { ButtonElementProps, ButtonProps, ButtonType } from "./Button.types";

import * as styles from "./Button.css";

const DEFAULT_BUTTON_TYPE: ButtonType = "button";

const ButtonElement = (props: ButtonElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    return (
        <button
            id={access(props.id)}
            ref={(element) => props.ref?.(element)}
            type={access(props.type) ?? DEFAULT_BUTTON_TYPE}
            class={styles.buttonElement}
            aria-label={getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            aria-pressed={access(props.flags).isPressed}
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
            {props.renderContent(() => access(props.flags))}
        </button>
    );
};

export const Button = (props: ButtonProps) => {
    return (
        <InteractionWrapper
            {...props}
            renderControl={(setElementRef, getFlags) => (
                <ButtonElement
                    ref={setElementRef}
                    ariaLabel={props.ariaLabel}
                    type={props.type}
                    id={props.id}
                    flags={getFlags}
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
};
