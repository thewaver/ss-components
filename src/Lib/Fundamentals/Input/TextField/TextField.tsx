import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import { CSSUtils, MathUtils, StringUtils } from "@thewaver/ss-utils";

import type { TextSyncElement } from "../../../Abstracts/TextSync/TextSync";
import { TextSync } from "../../../Abstracts/TextSync/TextSync";
import { access } from "../../../Utils/propUtils";
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
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<TextSyncElement>();

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const getIsReadOnly = () => access(props.flags).isReadOnly;

    const getIsTextArea = () => access(props.element) === "textarea";

    const getIsAutoSizing = () => getIsTextArea() && (access(props.isAutoSizing) ?? false);

    const getType = () => (getIsTextArea() ? undefined : (access(props.type) ?? DEFAULT_TEXT_FIELD_TYPE));

    const getIsSpinButton = () => access(props.isSpinButton) ?? false;

    const getValueNow = () => {
        const parsed = Number(access(props.value));

        return access(props.value) !== "" && Number.isFinite(parsed) ? parsed : undefined;
    };

    const getOverflowY = () => {
        if (!getIsTextArea()) return undefined;

        return getIsAutoSizing() && access(props.maxRows) === undefined ? "hidden" : "auto";
    };

    const { handleInput, handleCompositionStart, handleCompositionEnd } = TextSync.createValueSync(
        getElementRef,
        () => access(props.value),
        {
            onInput: (value) => {
                void props.onInput?.(value);
            },
            computeMaskedText: props.computeMaskedText,
        },
    );

    return (
        <>
            {props.renderContent(() => access(props.flags))}

            {props.renderPlaceholder && (
                <div class={styles.textFieldPlaceholder} style={access(props.textInset)}>
                    {props.renderPlaceholder(() => access(props.flags), access(props.placeholderHint))}
                </div>
            )}

            <Dynamic
                component={access(props.element)}
                id={access(props.id)}
                ref={(element: TextSyncElement) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type={getType()}
                rows={getIsAutoSizing() ? 1 : undefined}
                name={access(props.name)}
                class={styles.textFieldElement}
                classList={{ [styles.textFieldTextArea]: getIsTextArea() }}
                style={{
                    ...access(props.textInset),
                    ...props.computeTextStyle?.(() => access(props.flags)),
                    "overflow-y": getOverflowY(),
                }}
                autocomplete={access(props.autoComplete)}
                inputMode={access(props.inputMode)}
                min={getType() === "number" ? access(props.min) : undefined}
                max={getType() === "number" ? access(props.max) : undefined}
                step={getType() === "number" ? access(props.step) : undefined}
                readOnly={getIsDisabled() || getIsReadOnly()}
                role={getIsSpinButton() ? "spinbutton" : undefined}
                aria-label={getAriaLabel()}
                aria-describedby={getAriaDescribedBy()}
                aria-valuenow={getIsSpinButton() ? getValueNow() : undefined}
                aria-valuemin={getIsSpinButton() ? access(props.min) : undefined}
                aria-valuemax={getIsSpinButton() ? access(props.max) : undefined}
                aria-disabled={getIsDisabled() || undefined}
                aria-readonly={getIsReadOnly() || undefined}
                aria-invalid={access(props.flags).hasError || undefined}
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
                    style={{ left: `${access(props.spreadPadding).paddingLeft}px` }}
                >
                    {props.renderLeading(() => access(props.flags))}
                </div>
            )}

            {props.renderTrailing && (
                <div
                    ref={props.setTrailingRef}
                    class={styles.textFieldAdornment}
                    style={{ right: `${access(props.spreadPadding).paddingRight}px` }}
                >
                    {props.renderTrailing(() => access(props.flags))}
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

    const getIsAutoSizing = createMemo(
        () => access(props.element) === "textarea" && (access(props.isAutoSizing) ?? false),
    );

    const getMinRows = () => access(props.minRows) ?? DEFAULT_TEXT_FIELD_MIN_ROWS;

    const getMaxRows = () => access(props.maxRows);

    const getMinHeight = createAutoHeight(getControlRef, getIsAutoSizing, getMinRows, getMaxRows, () =>
        props.valueSignal[0](),
    );

    const getSpreadPadding = createMemo(() => {
        const padding = access(props.padding) ?? DEFAULT_TEXT_FIELD_PADDING;

        return typeof padding === "number" ? CSSUtils.spreadPadding(padding) : padding;
    });

    const getGap = () => access(props.gap) ?? DEFAULT_TEXT_FIELD_GAP;

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
            extraFlags={() => ({
                isEmpty: props.valueSignal[0]() === "",
                isReadOnly: access(props.isReadOnly) ?? false,
            })}
            minWidth={() => getLeadingInset() + getTrailingInset()}
            minHeight={getMinHeight}
            renderControl={(setElementRef, getFlags) => (
                <TextFieldElement
                    ref={(element) => {
                        setElementRef(element);
                        setControlRef(element);
                    }}
                    id={props.id}
                    element={props.element}
                    type={props.type}
                    name={props.name}
                    ariaLabel={props.ariaLabel}
                    isSpinButton={props.isSpinButton}
                    autoComplete={props.autoComplete}
                    inputMode={props.inputMode}
                    computeMaskedText={props.computeMaskedText}
                    placeholderHint={props.placeholderHint}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    isAutoSizing={getIsAutoSizing}
                    minRows={getMinRows}
                    maxRows={props.maxRows}
                    flags={getFlags}
                    value={() => props.valueSignal[0]()}
                    textInset={getTextInset}
                    spreadPadding={getSpreadPadding}
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
