import { createRenderEffect, createSignal } from "solid-js";

import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type { BinarySwitchElementProps, BinarySwitchFlags, BinarySwitchProps } from "./BinarySwitch.types";

import * as styles from "./BinarySwitch.css";

const BinarySwitchElement = (props: BinarySwitchElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const getIsMixed = () => props.getIsMixed?.() ?? false;

    const getRole = () => (props.getIsSwitch?.() && !getIsMixed() ? "switch" : undefined);

    const syncElement = (element: HTMLInputElement) => {
        element.checked = props.getIsChecked();
        element.indeterminate = getIsMixed();
    };

    createRenderEffect(() => {
        const element = getElementRef();

        if (!element) return;

        syncElement(element);
    });

    return (
        <>
            {props.renderContent(props.getFlags)}

            <input
                id={props.getId?.()}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type={props.getType()}
                name={props.getName?.()}
                role={getRole()}
                class={styles.binarySwitchElement}
                aria-label={getAriaLabel()}
                aria-describedby={getAriaDescribedBy()}
                aria-disabled={getIsDisabled() || undefined}
                aria-invalid={props.getFlags().hasError || undefined}
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

export const BinarySwitch = (props: BinarySwitchProps) => (
    <InteractionWrapper
        {...props}
        getExtraFlags={(): BinarySwitchFlags => ({
            checkedState: props.getIsMixed?.() ? "mixed" : props.getIsChecked(),
        })}
        renderControl={(setElementRef, getFlags) => (
            <BinarySwitchElement
                ref={setElementRef}
                getId={props.getId}
                getType={props.getType}
                getIsSwitch={props.getIsSwitch}
                getName={props.getName}
                getAriaLabel={props.getAriaLabel}
                getFlags={getFlags}
                getIsChecked={props.getIsChecked}
                getIsMixed={props.getIsMixed}
                renderContent={props.renderContent}
                onChange={props.onChange}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            />
        )}
    />
);
