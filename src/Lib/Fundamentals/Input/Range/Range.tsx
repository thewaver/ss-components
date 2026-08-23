import { Index, createMemo, createRenderEffect, createSignal } from "solid-js";

import { MathUtils } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type { RangeElementProps, RangeFlags, RangeOrientation, RangeProps, RangeSpan } from "./Range.types";

import * as styles from "./Range.css";

const DEFAULT_RANGE_ORIENTATION: RangeOrientation = "horizontal";
const DEFAULT_RANGE_MIN = 0;
const DEFAULT_RANGE_MAX = 100;
const DEFAULT_RANGE_STEP = 1;
const DEFAULT_RANGE_THUMB_SIZE = 16;
const MIN_TRACK_TRAVEL_PX = 1;

const RangeElement = (props: RangeElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getActiveThumb, setActiveThumb] = createSignal(0);
    const [getElementRefs, setElementRefs] = createSignal<HTMLInputElement[]>([]);

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const getThumbMin = (index: number) => (index === 0 ? access(props.min) : access(props.values)[index - 1]);

    const getThumbMax = (index: number) =>
        index === access(props.values).length - 1 ? access(props.max) : access(props.values)[index + 1];

    const syncElement = (element: HTMLInputElement, index: number) => {
        element.value = `${access(props.values)[index]}`;
    };

    const readPointerValue = (e: PointerEvent, element: HTMLInputElement) => {
        const isVertical = access(props.orientation) === "vertical";
        const rect = element.getBoundingClientRect();
        const span = isVertical ? rect.height : rect.width;
        const offset = isVertical ? rect.bottom - e.clientY : e.clientX - rect.left;
        const travel = Math.max(span - access(props.thumbSize), MIN_TRACK_TRAVEL_PX);
        const ratio = MathUtils.clamp01((offset - access(props.thumbSize) * 0.5) / travel);

        return access(props.min) + ratio * (access(props.max) - access(props.min));
    };

    const raiseNearestThumb = (e: PointerEvent, element: HTMLInputElement) => {
        const values = access(props.values);

        if (values.length < 2) return;

        const pointerValue = readPointerValue(e, element);
        const distances = values.map((value) => Math.abs(value - pointerValue));
        const shortest = Math.min(...distances);
        const isTied = distances.filter((distance) => distance === shortest).length > 1;

        if (isTied) {
            setActiveThumb(pointerValue > values[0] ? values.length - 1 : 0);
        } else {
            setActiveThumb(distances.indexOf(shortest));
        }
    };

    createRenderEffect(() => {
        getElementRefs().forEach(syncElement);
    });

    InteractionUtils.wrapExtraControls(() => getElementRefs().slice(1), getIsDisabled, {
        getIsTabbable: props.isTabbable === undefined ? undefined : () => access(props.isTabbable)!,
    });

    return (
        <>
            {props.renderContent(() => access(props.flags))}

            <Index each={access(props.values)}>
                {(_getValue, index) => (
                    <input
                        id={index === 0 ? access(props.id) : undefined}
                        ref={(element) => {
                            setElementRefs((refs) => {
                                const next = [...refs];

                                next[index] = element;

                                return next;
                            });

                            if (index === 0) props.ref?.(element);
                        }}
                        type="range"
                        name={access(props.name)}
                        class={[styles.rangeElement, styles.rangeOrientationVariants[access(props.orientation)]].join(
                            " ",
                        )}
                        style={{
                            ...assignInlineVars({ [styles.thumbSizeVar]: `${access(props.thumbSize)}px` }),
                            "z-index": index === getActiveThumb() ? 1 : undefined,
                        }}
                        min={getThumbMin(index)}
                        max={getThumbMax(index)}
                        step={access(props.step)}
                        aria-label={access(props.thumbLabels)?.[index] ?? getAriaLabel()}
                        aria-describedby={getAriaDescribedBy()}
                        aria-disabled={getIsDisabled() || undefined}
                        aria-invalid={access(props.flags).hasError || undefined}
                        onPointerDown={(e) => raiseNearestThumb(e, e.currentTarget)}
                        onPointerMove={(e) => {
                            if (e.buttons === 0) raiseNearestThumb(e, e.currentTarget);
                        }}
                        onFocus={() => props.setFocusedThumb(index)}
                        onBlur={() => props.setFocusedThumb(undefined)}
                        onInput={(e) => {
                            const element = e.currentTarget;

                            if (!getIsDisabled()) props.setValue(index, element.valueAsNumber);

                            syncElement(element, index);
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
                )}
            </Index>
        </>
    );
};

export const Range = (props: RangeProps) => {
    const hasSingle = props.valueSignal !== undefined;
    const hasPair = props.rangeSignal !== undefined;

    if (hasSingle === hasPair) {
        console.warn(
            "Range: give exactly one of valueSignal and rangeSignal — valueSignal drives a single thumb, rangeSignal drives a pair.",
        );
    }

    const [getFocusedThumb, setFocusedThumb] = createSignal<number>();

    const getOrientation = createMemo(() => access(props.orientation) ?? DEFAULT_RANGE_ORIENTATION);

    const getMin = createMemo(() => access(props.min) ?? DEFAULT_RANGE_MIN);

    const getMax = createMemo(() => access(props.max) ?? DEFAULT_RANGE_MAX);

    const getStep = createMemo(() => access(props.step) ?? DEFAULT_RANGE_STEP);

    const getThumbSize = createMemo(() => access(props.thumbSize) ?? DEFAULT_RANGE_THUMB_SIZE);

    const getValues = createMemo(() => {
        const range = props.rangeSignal?.[0]();

        return range ? [range.start, range.end] : [props.valueSignal?.[0]() ?? getMin()];
    });

    const getRatios = createMemo(() => {
        return getValues().map((value) => MathUtils.clamp01(MathUtils.normalize(value, getMin(), getMax())));
    });

    const getFill = createMemo((): RangeSpan => {
        const ratios = getRatios();

        return ratios.length > 1 ? { start: ratios[0], end: ratios[ratios.length - 1] } : { start: 0, end: ratios[0] };
    });

    const setValue = (index: number, value: number) => {
        const range = props.rangeSignal?.[0]();

        if (range) {
            props.rangeSignal?.[1](index === 0 ? { ...range, start: value } : { ...range, end: value });
        } else {
            props.valueSignal?.[1](value);
        }

        void props.onInput?.(getValues());
    };

    return (
        <InteractionWrapper
            {...props}
            extraFlags={(): RangeFlags => ({
                orientation: getOrientation(),
                values: getValues(),
                ratios: getRatios(),
                fill: getFill(),
                focusedThumb: getFocusedThumb(),
            })}
            renderControl={(setElementRef, getFlags) => (
                <RangeElement
                    ref={setElementRef}
                    id={props.id}
                    name={props.name}
                    ariaLabel={props.ariaLabel}
                    thumbLabels={props.thumbLabels}
                    orientation={getOrientation}
                    min={getMin}
                    max={getMax}
                    step={getStep}
                    thumbSize={getThumbSize}
                    flags={getFlags}
                    values={getValues}
                    isTabbable={props.isTabbable}
                    setValue={setValue}
                    setFocusedThumb={setFocusedThumb}
                    renderContent={props.renderContent}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
