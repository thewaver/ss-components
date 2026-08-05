import { createRenderEffect, createSignal } from "solid-js";

import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { useLabelContext } from "../Label/Label.context";
import type { BinarySwitchElementProps, BinarySwitchProps } from "./BinarySwitch.types";

import * as styles from "./BinarySwitch.css";

const BinarySwitchElement = (props: BinarySwitchElementProps) => {
    const labelContext = useLabelContext();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const getAriaLabel = () => (labelContext.getIsLabelled() ? undefined : props.getAriaLabel?.());

    if (labelContext.getIsLabelled() && props.getAriaLabel) {
        console.warn(
            "BinarySwitch: getAriaLabel was given inside a Label, and is being ignored. An aria-label overrides the visible caption as the accessible name, which leaves the two disagreeing — drop one of them.",
        );
    }

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
        getCheckedState={() => (props.getIsMixed?.() ? "mixed" : props.getIsChecked())}
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
