import type { Signal } from "solid-js";
import { createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";

import { Color } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { Popover } from "../../Popover/Popover";
import { ColorArea } from "../ColorArea/ColorArea";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import { Range } from "../Range/Range";
import type { ColorInputFieldProps, ColorInputFlags, ColorInputProps } from "./ColorInput.types";

import * as styles from "./ColorInput.css";

const DEFAULT_COLOR_INPUT_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_COLOR_INPUT_AREA_LABEL = "Saturation and brightness";
const DEFAULT_COLOR_INPUT_HUE_LABEL = "Hue";
const STARTING_COLOR: Color.HSVA = { h: 0, s: 0, v: 0, a: 1 };
const HUE_MAX = 360;
const HUE_STEP = 1;
const OPAQUE = 1;

const toHexValue = (hsva: Color.HSVA) => (hsva.a < OPAQUE ? Color.HSVA.toHexa(hsva) : Color.HSV.toHex(hsva));

const getIsSameValue = (a: string, b: string) =>
    Color.Hexa.isHexa(a) && Color.Hexa.isHexa(b) ? Color.Hexa.getIsSameHexa(a, b) : a === b;

const ColorInputField = (props: ColorInputFieldProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    return (
        <button
            id={access(props.id)}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.colorInputField}
            aria-label={getAriaLabel()}
            aria-describedby={getAriaDescribedBy()}
            aria-haspopup="dialog"
            aria-expanded={access(props.isOpen)}
            aria-controls={access(props.isOpen) ? access(props.popupId) : undefined}
            aria-disabled={getIsDisabled() || undefined}
            aria-invalid={access(props.flags).hasError || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onToggle();
            }}
            onMouseEnter={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                if (getIsDisabled()) return;

                void props.onMouseLeave?.(e);
            }}
        >
            {props.renderContent(() => access(props.flags))}
        </button>
    );
};

export const ColorInput = (props: ColorInputProps) => {
    const popupId = createUniqueId();

    const [getFieldRef, setFieldRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);
    const startingValue = props.valueSignal[0]();

    const [getHsv, setHsv] = createSignal<Color.HSVA>(
        Color.Hexa.isHexa(startingValue) ? Color.Hexa.toHsva(startingValue) : STARTING_COLOR,
    );

    const hsvSignal: Signal<Color.HSVA> = [getHsv, setHsv];
    const hueSignal: Signal<number> = [() => getHsv().h, (hue) => setHueValue(hue)];

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const setHueValue = (hue: number | ((prev: number) => number)) => {
        const next = typeof hue === "function" ? hue(untrack(() => getHsv().h)) : hue;

        setHsv((prev) => ({ ...prev, h: next }));

        return next;
    };

    const dismiss = () => {
        if (!getIsOpen()) return;

        setIsOpen(false);
        getFieldRef()?.focus();
    };

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (
            getIsSameValue(
                value,
                untrack(() => toHexValue(getHsv())),
            )
        )
            return;

        if (!Color.Hexa.isHexa(value)) return;

        setHsv(() => Color.Hexa.toHsva(value));
    });

    createEffect(() => {
        const value = toHexValue(getHsv());

        if (getIsSameValue(untrack(props.valueSignal[0]), value)) return;

        props.valueSignal[1](value);

        void props.onInput?.(value);
    });

    const renderSurface = () => (
        <>
            <ColorArea
                hsvSignal={hsvSignal}
                sizing={"fill"}
                isDisabled={getIsDisabled}
                ariaLabel={() => access(props.areaLabel) ?? DEFAULT_COLOR_INPUT_AREA_LABEL}
                renderContent={props.renderArea}
            />

            <Range
                valueSignal={hueSignal}
                sizing={"fill"}
                isDisabled={getIsDisabled}
                max={() => HUE_MAX}
                step={() => HUE_STEP}
                ariaLabel={() => access(props.hueLabel) ?? DEFAULT_COLOR_INPUT_HUE_LABEL}
                renderContent={props.renderHue}
            />
        </>
    );

    return (
        <>
            <InteractionWrapper
                {...props}
                extraFlags={(): ColorInputFlags => ({
                    value: props.valueSignal[0](),
                    hsv: getHsv(),
                    isOpen: getIsOpen(),
                })}
                ref={(element) => {
                    setFieldRef(element);
                    props.ref?.(element);
                }}
                renderControl={(setElementRef, getFlags) => (
                    <ColorInputField
                        ref={setElementRef}
                        id={props.id}
                        ariaLabel={props.ariaLabel}
                        popupId={() => popupId}
                        isOpen={getIsOpen}
                        flags={getFlags}
                        renderContent={props.renderContent}
                        onToggle={() => setIsOpen((prev) => !prev)}
                        onMouseEnter={props.onMouseEnter}
                        onMouseLeave={props.onMouseLeave}
                    />
                )}
            />

            <Popover
                id={() => popupId}
                role={"dialog"}
                ariaAttributes={() => ({ "aria-label": access(props.ariaLabel) })}
                isOpen={getIsOpen}
                anchorRef={getFieldRef}
                placement={() => access(props.placement) ?? DEFAULT_COLOR_INPUT_PLACEMENT}
                offset={props.offset}
                transitionDurationMs={props.transitionDurationMs}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderSurface, hsvSignal, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </>
    );
};
