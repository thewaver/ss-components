import { createRenderEffect, createSignal } from "solid-js";

import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { LabelUtils } from "../Label/Label.utils";
import type { ColorInputElementProps, ColorInputFlags, ColorInputProps } from "./ColorInput.types";

import * as styles from "./ColorInput.css";

const ColorInputElement = (props: ColorInputElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const syncElement = (element: HTMLInputElement) => {
        const value = props.getValue();

        if (element.value === value) return;

        element.value = value;
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
                type="color"
                name={props.getName?.()}
                class={styles.colorInputElement}
                aria-label={getAriaLabel()}
                aria-disabled={getIsDisabled() || undefined}
                aria-invalid={props.getFlags().hasError || undefined}
                onClick={(e) => {
                    if (getIsDisabled()) e.preventDefault();
                }}
                onInput={(e) => {
                    const element = e.currentTarget;

                    if (getIsDisabled()) return;

                    void props.onInput?.(element.value);

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

export const ColorInput = (props: ColorInputProps) => (
    <InteractionWrapper
        {...props}
        getExtraFlags={(): ColorInputFlags => ({ value: props.valueSignal[0]() })}
        renderControl={(setElementRef, getFlags) => (
            <ColorInputElement
                ref={setElementRef}
                getId={props.getId}
                getName={props.getName}
                getAriaLabel={props.getAriaLabel}
                getFlags={getFlags}
                getValue={() => props.valueSignal[0]()}
                renderContent={props.renderContent}
                onInput={(value) => {
                    props.valueSignal[1](value);

                    void props.onInput?.(value);
                }}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            />
        )}
    />
);
