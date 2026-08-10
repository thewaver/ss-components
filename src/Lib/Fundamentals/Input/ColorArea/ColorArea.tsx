import { For, createRenderEffect, createSignal } from "solid-js";

import type { ColorValueHsv } from "../../../Abstracts/ColorValue/ColorValue.types";
import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { LabelUtils } from "../Label/Label.utils";
import type { ColorAreaAxis, ColorAreaElementProps, ColorAreaFlags, ColorAreaProps } from "./ColorArea.types";

import * as styles from "./ColorArea.css";

const DEFAULT_COLOR_AREA_STEP = 0.01;
const DEFAULT_COLOR_AREA_AXIS_LABELS: Record<ColorAreaAxis, string> = {
    saturation: "Saturation",
    brightness: "Brightness",
};

const AXES: ColorAreaAxis[] = ["saturation", "brightness"];
const RATIO_MIN = 0;
const RATIO_MAX = 1;
const PERCENT = 100;

const getAxisRatio = (hsv: ColorValueHsv, axis: ColorAreaAxis) => (axis === "saturation" ? hsv.s : hsv.v);

const ColorAreaElement = (props: ColorAreaElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const [getSurfaceRef, setSurfaceRef] = createSignal<HTMLElement>();
    const [getAxisRefs, setAxisRefs] = createSignal<Partial<Record<ColorAreaAxis, HTMLInputElement>>>({});

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const { getIsDragging } = InteractionUtils.trackDrag(getSurfaceRef, getIsDisabled, {
        onDrag: (ratio) => {
            props.setAxis("saturation", ratio.x);
            props.setAxis("brightness", RATIO_MAX - ratio.y);
            getAxisRefs().saturation?.focus();
        },
    });

    createRenderEffect(() => {
        props.setIsDragging(getIsDragging());
    });

    createRenderEffect(() => {
        const hsv = props.getHsv();

        for (const axis of AXES) {
            const element = getAxisRefs()[axis];
            const value = `${getAxisRatio(hsv, axis)}`;

            if (!element || element.value === value) continue;

            element.value = value;
        }
    });

    return (
        <div
            ref={(element) => {
                setSurfaceRef(element);
                props.ref?.(element);
            }}
            id={props.getId?.()}
            class={styles.colorAreaSurface}
            role="group"
            aria-label={getAriaLabel()}
            aria-disabled={getIsDisabled() || undefined}
            aria-invalid={props.getFlags().hasError || undefined}
            onMouseEnter={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseLeave?.(e);
            }}
        >
            {props.renderContent(props.getFlags)}

            <For each={AXES}>
                {(axis) => (
                    <input
                        ref={(element) => setAxisRefs((prev) => ({ ...prev, [axis]: element }))}
                        type="range"
                        name={props.getName?.() && `${props.getName()}-${axis}`}
                        class={styles.colorAreaAxis}
                        min={RATIO_MIN}
                        max={RATIO_MAX}
                        step={props.getStep()}
                        aria-label={props.getAxisLabels()[axis]}
                        aria-valuetext={`${Math.round(getAxisRatio(props.getHsv(), axis) * PERCENT)}%`}
                        aria-disabled={getIsDisabled() || undefined}
                        onInput={(e) => {
                            if (getIsDisabled()) return;

                            props.setAxis(axis, Number(e.currentTarget.value));
                        }}
                        onFocus={() => props.setFocusedAxis(axis)}
                        onBlur={() => props.setFocusedAxis(undefined)}
                    />
                )}
            </For>
        </div>
    );
};

export const ColorArea = (props: ColorAreaProps) => {
    const [getFocusedAxis, setFocusedAxis] = createSignal<ColorAreaAxis>();
    const [getIsDragging, setIsDragging] = createSignal(false);

    const setAxis = (axis: ColorAreaAxis, ratio: number) => {
        const clamped = Math.min(Math.max(ratio, RATIO_MIN), RATIO_MAX);
        const hsv = props.hsvSignal[0]();
        const next = axis === "saturation" ? { ...hsv, s: clamped } : { ...hsv, v: clamped };

        props.hsvSignal[1](() => next);

        void props.onInput?.(next);
    };

    return (
        <InteractionWrapper
            {...props}
            getExtraFlags={(): ColorAreaFlags => ({
                hsv: props.hsvSignal[0](),
                isDragging: getIsDragging(),
                focusedAxis: getFocusedAxis(),
            })}
            renderControl={(setElementRef, getFlags) => (
                <ColorAreaElement
                    ref={setElementRef}
                    getId={props.getId}
                    getName={props.getName}
                    getAriaLabel={props.getAriaLabel}
                    getAxisLabels={() => props.getAxisLabels?.() ?? DEFAULT_COLOR_AREA_AXIS_LABELS}
                    getStep={() => props.getStep?.() ?? DEFAULT_COLOR_AREA_STEP}
                    getFlags={getFlags}
                    getHsv={() => props.hsvSignal[0]()}
                    renderContent={props.renderContent}
                    setAxis={setAxis}
                    setFocusedAxis={setFocusedAxis}
                    setIsDragging={setIsDragging}
                    onMouseEnter={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
                />
            )}
        />
    );
};
