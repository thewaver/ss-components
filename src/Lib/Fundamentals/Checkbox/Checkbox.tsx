import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { CheckboxElementProps, CheckboxProps } from "./Checkbox.types";

import * as styles from "./Checkbox.css";

const CheckboxElement = (props: CheckboxElementProps) => {
    const getIsDisabled = () => props.getFlags?.().isDisabled ?? false;

    return (
        <input
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="checkbox"
            class={styles.checkboxElement}
            checked={props.getIsChecked()}
            disabled={getIsDisabled() && !(props.getIsReachable?.() ?? false)}
            aria-label={props.getAriaLabel?.()}
            aria-disabled={getIsDisabled() || undefined}
            aria-invalid={props.getFlags?.().hasError || undefined}
            onClick={(e) => {
                if (getIsDisabled()) e.preventDefault();
            }}
            onChange={(e) => {
                if (getIsDisabled()) return;

                void props.onChange?.(e.currentTarget.checked);
            }}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
        />
    );
};

export const Checkbox = (props: CheckboxProps) => {
    const handleChange = (isChecked: boolean) => {
        props.checkedSignal[1](isChecked);

        void props.onChange?.(isChecked);
    };

    return (
        <InteractionWrapper
            {...props}
            renderControl={(setElementRef, getFlags, getIsReachable) => (
                <CheckboxElement
                    ref={setElementRef}
                    getId={props.getId}
                    getAriaLabel={props.getAriaLabel}
                    getFlags={getFlags}
                    getIsReachable={getIsReachable}
                    getIsChecked={() => props.checkedSignal[0]()}
                    onChange={handleChange}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
