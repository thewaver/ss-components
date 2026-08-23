import { createRenderEffect, createSignal } from "solid-js";

import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type { BinarySwitchElementProps, BinarySwitchFlags, BinarySwitchProps } from "./BinarySwitch.types";

import * as styles from "./BinarySwitch.css";

const BinarySwitchElement = (props: BinarySwitchElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const getIsMixed = () => access(props.isMixed) ?? false;

    const getRole = () => (access(props.isSwitch) && !getIsMixed() ? "switch" : undefined);

    const syncElement = (element: HTMLInputElement) => {
        element.checked = access(props.isChecked);
        element.indeterminate = getIsMixed();
    };

    createRenderEffect(() => {
        const element = getElementRef();

        if (!element) return;

        syncElement(element);
    });

    return (
        <>
            {props.renderContent(() => access(props.flags))}

            <input
                id={access(props.id)}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type={access(props.type)}
                name={access(props.name)}
                role={getRole()}
                class={styles.binarySwitchElement}
                aria-label={getAriaLabel()}
                aria-describedby={getAriaDescribedBy()}
                aria-disabled={getIsDisabled() || undefined}
                aria-invalid={access(props.flags).hasError || undefined}
                onClick={(e) => {
                    if (getIsDisabled()) e.preventDefault();
                }}
                onChange={(e) => {
                    const element = e.currentTarget;

                    if (getIsDisabled()) return;

                    void props.onChange?.(element.checked);

                    syncElement(element);
                }}
                onMouseEnter={(e) => {
                    if (getIsDisabled()) return;

                    void props.onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    if (getIsDisabled()) return;

                    void props.onMouseLeave?.(e);
                }}
            />
        </>
    );
};

export const BinarySwitch = (props: BinarySwitchProps) => {
    return (
        <InteractionWrapper
            {...props}
            extraFlags={(): BinarySwitchFlags => ({
                checkedState: access(props.isMixed) ? "mixed" : access(props.isChecked),
            })}
            renderControl={(setElementRef, getFlags) => (
                <BinarySwitchElement
                    ref={setElementRef}
                    id={props.id}
                    type={props.type}
                    isSwitch={props.isSwitch}
                    name={props.name}
                    ariaLabel={props.ariaLabel}
                    flags={getFlags}
                    isChecked={props.isChecked}
                    isMixed={props.isMixed}
                    renderContent={props.renderContent}
                    onChange={props.onChange}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
