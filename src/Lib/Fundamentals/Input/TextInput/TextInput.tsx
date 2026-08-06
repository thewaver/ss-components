import type { Accessor } from "solid-js";
import { createEffect, createMemo, createRenderEffect, createSignal, onCleanup } from "solid-js";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { LabelUtils } from "../Label/Label.utils";
import type { TextInputElementProps, TextInputProps, TextInputType } from "./TextInput.types";

import * as styles from "./TextInput.css";

const DEFAULT_TEXT_INPUT_TYPE: TextInputType = "text";
const DEFAULT_TEXT_INPUT_PADDING = 0;
const DEFAULT_TEXT_INPUT_GAP = 0;

const createAdornmentWidth = (getRef: Accessor<HTMLElement | undefined>) => {
    const [getWidth, setWidth] = createSignal(0);

    createEffect(() => {
        const ref = getRef();

        if (!ref) {
            setWidth(0);
            return;
        }

        setWidth(ref.offsetWidth);

        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.borderBoxSize[0].inlineSize);
        });

        observer.observe(ref);

        onCleanup(() => {
            observer.disconnect();
        });
    });

    return getWidth;
};

const TextInputElement = (props: TextInputElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();
    const [getIsComposing, setIsComposing] = createSignal(false);

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const getIsReadOnly = () => props.getFlags().isReadOnly;

    const syncElement = (element: HTMLInputElement) => {
        const value = props.getValue();

        if (getIsComposing() || element.value === value) return;

        const { selectionStart, selectionEnd } = element;

        element.value = value;

        if (selectionStart === null || selectionEnd === null) return;

        element.setSelectionRange(selectionStart, selectionEnd);
    };

    const reportValue = (element: HTMLInputElement) => {
        void props.onInput?.(element.value);

        syncElement(element);
    };

    createRenderEffect(() => {
        const element = getElementRef();

        if (!element) return;

        syncElement(element);
    });

    return (
        <>
            {props.renderContent(props.getFlags)}

            {props.renderPlaceholder && (
                <div class={styles.textInputPlaceholder} style={props.getTextInset()}>
                    {props.renderPlaceholder(props.getFlags)}
                </div>
            )}

            <input
                id={props.getId?.()}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type={props.getType?.() ?? DEFAULT_TEXT_INPUT_TYPE}
                name={props.getName?.()}
                class={styles.textInputElement}
                style={{ ...props.getTextInset(), ...props.computeTextStyle?.(props.getFlags) }}
                autocomplete={props.getAutoComplete?.()}
                inputMode={props.getInputMode?.()}
                min={props.getMin?.()}
                max={props.getMax?.()}
                step={props.getStep?.()}
                readOnly={getIsDisabled() || getIsReadOnly()}
                aria-label={getAriaLabel()}
                aria-disabled={getIsDisabled() || undefined}
                aria-readonly={getIsReadOnly() || undefined}
                aria-invalid={props.getFlags().hasError || undefined}
                onInput={(e) => {
                    if (getIsComposing()) return;

                    reportValue(e.currentTarget);
                }}
                onCompositionStart={() => {
                    setIsComposing(true);
                }}
                onCompositionEnd={(e) => {
                    setIsComposing(false);

                    reportValue(e.currentTarget);
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

            {props.renderLeading && (
                <div
                    ref={props.setLeadingRef}
                    class={styles.textInputAdornment}
                    style={{ left: `${props.getSpreadPadding().paddingLeft}px` }}
                >
                    {props.renderLeading(props.getFlags)}
                </div>
            )}

            {props.renderTrailing && (
                <div
                    ref={props.setTrailingRef}
                    class={styles.textInputAdornment}
                    style={{ right: `${props.getSpreadPadding().paddingRight}px` }}
                >
                    {props.renderTrailing(props.getFlags)}
                </div>
            )}
        </>
    );
};

export const TextInput = (props: TextInputProps) => {
    const [getLeadingRef, setLeadingRef] = createSignal<HTMLElement>();
    const [getTrailingRef, setTrailingRef] = createSignal<HTMLElement>();

    const getLeadingWidth = createAdornmentWidth(getLeadingRef);
    const getTrailingWidth = createAdornmentWidth(getTrailingRef);

    const getSpreadPadding = createMemo(() => {
        const padding = props.getPadding?.() ?? DEFAULT_TEXT_INPUT_PADDING;

        return typeof padding === "number" ? CSSUtils.spreadPadding(padding) : padding;
    });

    const getGap = () => props.getGap?.() ?? DEFAULT_TEXT_INPUT_GAP;

    const computeInset = (edge: number, adornmentWidth: number) =>
        edge + (adornmentWidth ? adornmentWidth + getGap() : 0);

    const getLeadingInset = createMemo(() => computeInset(getSpreadPadding().paddingLeft, getLeadingWidth()));

    const getTrailingInset = createMemo(() => computeInset(getSpreadPadding().paddingRight, getTrailingWidth()));

    const getTextInset = createMemo(() =>
        CSSUtils.spreadableToStyle(
            { ...getSpreadPadding(), paddingLeft: getLeadingInset(), paddingRight: getTrailingInset() },
            StringUtils.camelToKebabCase,
        ),
    );

    return (
        <InteractionWrapper
            {...props}
            getExtraFlags={() => ({
                isEmpty: props.valueSignal[0]() === "",
                isReadOnly: props.getIsReadOnly?.() ?? false,
            })}
            getMinWidth={() => getLeadingInset() + getTrailingInset()}
            renderControl={(setElementRef, getFlags) => (
                <TextInputElement
                    ref={setElementRef}
                    getId={props.getId}
                    getType={props.getType}
                    getName={props.getName}
                    getAriaLabel={props.getAriaLabel}
                    getAutoComplete={props.getAutoComplete}
                    getInputMode={props.getInputMode}
                    getMin={props.getMin}
                    getMax={props.getMax}
                    getStep={props.getStep}
                    getFlags={getFlags}
                    getValue={() => props.valueSignal[0]()}
                    getTextInset={getTextInset}
                    getSpreadPadding={getSpreadPadding}
                    setLeadingRef={setLeadingRef}
                    setTrailingRef={setTrailingRef}
                    computeTextStyle={props.computeTextStyle}
                    renderContent={props.renderContent}
                    renderPlaceholder={props.renderPlaceholder}
                    renderLeading={props.renderLeading}
                    renderTrailing={props.renderTrailing}
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
};
