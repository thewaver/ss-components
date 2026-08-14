import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import { CSSUtils, MathUtils, StringUtils } from "@thewaver/ss-utils";

import type { TextSyncElement } from "../../../Abstracts/TextSync/TextSync";
import { TextSync } from "../../../Abstracts/TextSync/TextSync";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type { TextFieldElementProps, TextFieldProps, TextFieldType } from "./TextField.types";

import * as styles from "./TextField.css";

const DEFAULT_TEXT_FIELD_TYPE: TextFieldType = "text";
const DEFAULT_TEXT_FIELD_PADDING = 0;
const DEFAULT_TEXT_FIELD_GAP = 0;
const DEFAULT_TEXT_FIELD_MIN_ROWS = 2;
const FALLBACK_LINE_HEIGHT_RATIO = 1.2;

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

const measureContentHeight = (element: HTMLElement, minRows: number, maxRows: number | undefined) => {
    const style = getComputedStyle(element);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * FALLBACK_LINE_HEIGHT_RATIO;
    const framing = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

    element.style.bottom = "auto";

    const contentHeight = element.scrollHeight;

    element.style.bottom = "";

    const floor = minRows * lineHeight + framing;
    const ceiling = maxRows === undefined ? Number.POSITIVE_INFINITY : maxRows * lineHeight + framing;

    return MathUtils.clamp(contentHeight, floor, ceiling);
};

const createAutoHeight = (
    getRef: Accessor<HTMLElement | undefined>,
    getIsEnabled: Accessor<boolean>,
    getMinRows: Accessor<number>,
    getMaxRows: Accessor<number | undefined>,
    getValue: Accessor<string>,
) => {
    const [getHeight, setHeight] = createSignal(0);

    const measure = (element: HTMLElement) => {
        setHeight(measureContentHeight(element, getMinRows(), getMaxRows()));
    };

    createEffect(() => {
        const ref = getRef();

        if (!ref || !getIsEnabled()) {
            setHeight(0);
            return;
        }

        getValue();
        getMinRows();
        getMaxRows();

        measure(ref);
    });

    createEffect(() => {
        const ref = getRef();

        if (!ref || !getIsEnabled()) return;

        let lastWidth = ref.clientWidth;

        const observer = new ResizeObserver(([entry]) => {
            const width = entry.contentBoxSize[0].inlineSize;

            if (width === lastWidth) return;

            lastWidth = width;

            measure(ref);
        });

        observer.observe(ref);

        onCleanup(() => {
            observer.disconnect();
        });
    });

    return getHeight;
};

const TextFieldElement = (props: TextFieldElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<TextSyncElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const getIsReadOnly = () => props.getFlags().isReadOnly;

    const getIsTextArea = () => props.getElement() === "textarea";

    const getIsAutoSizing = () => getIsTextArea() && (props.getIsAutoSizing?.() ?? false);

    const getType = () => (getIsTextArea() ? undefined : (props.getType?.() ?? DEFAULT_TEXT_FIELD_TYPE));

    const getIsSpinButton = () => props.getIsSpinButton?.() ?? false;

    const getValueNow = () => {
        const parsed = Number(props.getValue());

        return props.getValue() !== "" && Number.isFinite(parsed) ? parsed : undefined;
    };

    const getOverflowY = () => {
        if (!getIsTextArea()) return undefined;

        return getIsAutoSizing() && props.getMaxRows?.() === undefined ? "hidden" : "auto";
    };

    const { handleInput, handleCompositionStart, handleCompositionEnd } = TextSync.createValueSync(
        getElementRef,
        props.getValue,
        {
            onInput: (value) => {
                void props.onInput?.(value);
            },
            computeMaskedText: props.computeMaskedText,
        },
    );

    return (
        <>
            {props.renderContent(props.getFlags)}

            {props.renderPlaceholder && (
                <div class={styles.textFieldPlaceholder} style={props.getTextInset()}>
                    {props.renderPlaceholder(props.getFlags, props.getPlaceholderHint?.())}
                </div>
            )}

            <Dynamic
                component={props.getElement()}
                id={props.getId?.()}
                ref={(element: TextSyncElement) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type={getType()}
                rows={getIsAutoSizing() ? 1 : undefined}
                name={props.getName?.()}
                class={styles.textFieldElement}
                classList={{ [styles.textFieldTextArea]: getIsTextArea() }}
                style={{
                    ...props.getTextInset(),
                    ...props.computeTextStyle?.(props.getFlags),
                    "overflow-y": getOverflowY(),
                }}
                autocomplete={props.getAutoComplete?.()}
                inputMode={props.getInputMode?.()}
                min={getType() === "number" ? props.getMin?.() : undefined}
                max={getType() === "number" ? props.getMax?.() : undefined}
                step={getType() === "number" ? props.getStep?.() : undefined}
                readOnly={getIsDisabled() || getIsReadOnly()}
                role={getIsSpinButton() ? "spinbutton" : undefined}
                aria-label={getAriaLabel()}
                aria-describedby={getAriaDescribedBy()}
                aria-valuenow={getIsSpinButton() ? getValueNow() : undefined}
                aria-valuemin={getIsSpinButton() ? props.getMin?.() : undefined}
                aria-valuemax={getIsSpinButton() ? props.getMax?.() : undefined}
                aria-disabled={getIsDisabled() || undefined}
                aria-readonly={getIsReadOnly() || undefined}
                aria-invalid={props.getFlags().hasError || undefined}
                onInput={(e: InputEvent & { currentTarget: TextSyncElement }) => handleInput(e.currentTarget)}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={(e: CompositionEvent & { currentTarget: TextSyncElement }) =>
                    handleCompositionEnd(e.currentTarget)
                }
                onKeyDown={(e: KeyboardEvent) => {
                    if (getIsDisabled()) return;

                    void props.onKeyDown?.(e);
                }}
                onBlur={() => {
                    if (getIsDisabled()) return;

                    void props.onBlur?.();
                }}
                onMouseEnter={(e: MouseEvent) => {
                    if (getIsDisabled()) return;

                    void props.onMouseEnter?.(e);
                }}
                onMouseLeave={(e: MouseEvent) => {
                    if (getIsDisabled()) return;

                    void props.onMouseLeave?.(e);
                }}
            />

            {props.renderLeading && (
                <div
                    ref={props.setLeadingRef}
                    class={styles.textFieldAdornment}
                    style={{ left: `${props.getSpreadPadding().paddingLeft}px` }}
                >
                    {props.renderLeading(props.getFlags)}
                </div>
            )}

            {props.renderTrailing && (
                <div
                    ref={props.setTrailingRef}
                    class={styles.textFieldAdornment}
                    style={{ right: `${props.getSpreadPadding().paddingRight}px` }}
                >
                    {props.renderTrailing(props.getFlags)}
                </div>
            )}
        </>
    );
};

export const TextField = (props: TextFieldProps) => {
    const [getControlRef, setControlRef] = createSignal<HTMLElement>();
    const [getLeadingRef, setLeadingRef] = createSignal<HTMLElement>();
    const [getTrailingRef, setTrailingRef] = createSignal<HTMLElement>();

    const getLeadingWidth = createAdornmentWidth(getLeadingRef);
    const getTrailingWidth = createAdornmentWidth(getTrailingRef);

    const getIsAutoSizing = createMemo(() => props.getElement() === "textarea" && (props.getIsAutoSizing?.() ?? false));

    const getMinRows = () => props.getMinRows?.() ?? DEFAULT_TEXT_FIELD_MIN_ROWS;

    const getMaxRows = () => props.getMaxRows?.();

    const getMinHeight = createAutoHeight(getControlRef, getIsAutoSizing, getMinRows, getMaxRows, () =>
        props.valueSignal[0](),
    );

    const getSpreadPadding = createMemo(() => {
        const padding = props.getPadding?.() ?? DEFAULT_TEXT_FIELD_PADDING;

        return typeof padding === "number" ? CSSUtils.spreadPadding(padding) : padding;
    });

    const getGap = () => props.getGap?.() ?? DEFAULT_TEXT_FIELD_GAP;

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
            getMinHeight={getMinHeight}
            renderControl={(setElementRef, getFlags) => (
                <TextFieldElement
                    ref={(element) => {
                        setElementRef(element);
                        setControlRef(element);
                    }}
                    getId={props.getId}
                    getElement={props.getElement}
                    getType={props.getType}
                    getName={props.getName}
                    getAriaLabel={props.getAriaLabel}
                    getIsSpinButton={props.getIsSpinButton}
                    getAutoComplete={props.getAutoComplete}
                    getInputMode={props.getInputMode}
                    computeMaskedText={props.computeMaskedText}
                    getPlaceholderHint={props.getPlaceholderHint}
                    getMin={props.getMin}
                    getMax={props.getMax}
                    getStep={props.getStep}
                    getIsAutoSizing={getIsAutoSizing}
                    getMinRows={getMinRows}
                    getMaxRows={props.getMaxRows}
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
                    onKeyDown={props.onKeyDown}
                    onBlur={props.onBlur}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
