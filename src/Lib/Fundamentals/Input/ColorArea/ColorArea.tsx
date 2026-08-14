import { For, createRenderEffect, createSignal } from "solid-js";

import { Color, MathUtils } from "@thewaver/ss-utils";

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

const getAxisRatio = (hsv: Color.HSVA, axis: ColorAreaAxis) => (axis === "saturation" ? hsv.s : hsv.v);

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

    const syncAxis = (element: HTMLInputElement, axis: ColorAreaAxis) => {
        const value = `${getAxisRatio(props.getHsv(), axis)}`;

        if (element.value === value) return;

        element.value = value;
    };

    createRenderEffect(() => {
        for (const axis of AXES) {
            const element = getAxisRefs()[axis];

            if (element) syncAxis(element, axis);
        }
    });

    InteractionUtils.wrapExtraControls(() => AXES.map((axis) => getAxisRefs()[axis]), getIsDisabled, {
        getIsTabbable: props.getIsTabbable,
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
                            const element = e.currentTarget;

                            if (!getIsDisabled()) props.setAxis(axis, Number(element.value));

                            syncAxis(element, axis);
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
        const clamped = MathUtils.clamp01(ratio);
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
                    getIsTabbable={props.getIsTabbable}
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
