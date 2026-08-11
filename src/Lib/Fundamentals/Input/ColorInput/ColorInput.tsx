import type { Signal } from "solid-js";
import { createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { ColorValueHsv } from "../../../Abstracts/ColorValue/ColorValue.types";
import { ColorValueUtils } from "../../../Abstracts/ColorValue/ColorValue.utils";
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
const STARTING_COLOR: ColorValueHsv = { h: 0, s: 0, v: 0, a: 1 };
const HUE_MAX = 360;
const HUE_STEP = 1;
const OPAQUE = 1;

const toHexValue = (hsv: ColorValueHsv) => {
    const rgba = ColorValueUtils.hsvToRgba(hsv);

    return rgba.a < OPAQUE ? ColorValueUtils.toHexa(rgba) : ColorValueUtils.toHex(rgba);
};

const ColorInputField = (props: ColorInputFieldProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.colorInputField}
            aria-label={getAriaLabel()}
            aria-describedby={getAriaDescribedBy()}
            aria-haspopup="dialog"
            aria-expanded={props.getIsOpen()}
            aria-controls={props.getIsOpen() ? props.getPopupId() : undefined}
            aria-disabled={getIsDisabled() || undefined}
            aria-invalid={props.getFlags().hasError || undefined}
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
            {props.renderContent(props.getFlags)}
        </button>
    );
};

export const ColorInput = (props: ColorInputProps) => {
    const popupId = createUniqueId();

    const [getFieldRef, setFieldRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = createSignal(false);
    const [getHsv, setHsv] = createSignal<ColorValueHsv>(
        ColorValueUtils.fromHexa(props.valueSignal[0]())
            ? ColorValueUtils.rgbaToHsv(ColorValueUtils.fromHexa(props.valueSignal[0]())!)
            : STARTING_COLOR,
    );

    const hsvSignal: Signal<ColorValueHsv> = [getHsv, setHsv];
    const hueSignal: Signal<number> = [() => getHsv().h, (hue) => setHueValue(hue)];

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const setHueValue = (hue: number | ((prev: number) => number)) => {
        const next = typeof hue === "function" ? hue(untrack(() => getHsv().h)) : hue;

        setHsv((prev) => ({ ...prev, h: next }));

        return next;
    };

    const dismiss = () => {
        setIsOpen(false);
        getFieldRef()?.focus();
    };

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (
            ColorValueUtils.getIsSameHex(
                value,
                untrack(() => toHexValue(getHsv())),
            )
        )
            return;

        const rgba = ColorValueUtils.fromHexa(value);

        if (!rgba) return;

        setHsv(() => ColorValueUtils.rgbaToHsv(rgba));
    });

    createEffect(() => {
        const value = toHexValue(getHsv());

        if (ColorValueUtils.getIsSameHex(untrack(props.valueSignal[0]), value)) return;

        props.valueSignal[1](value);

        void props.onInput?.(value);
    });

    const renderSurface = () => (
        <>
            <ColorArea
                hsvSignal={hsvSignal}
                getSizing={() => "fill"}
                getIsDisabled={getIsDisabled}
                getAriaLabel={() => props.getAreaLabel?.() ?? DEFAULT_COLOR_INPUT_AREA_LABEL}
                renderContent={props.renderArea}
            />

            <Range
                valueSignal={hueSignal}
                getSizing={() => "fill"}
                getIsDisabled={getIsDisabled}
                getMax={() => HUE_MAX}
                getStep={() => HUE_STEP}
                getAriaLabel={() => props.getHueLabel?.() ?? DEFAULT_COLOR_INPUT_HUE_LABEL}
                renderContent={props.renderHue}
            />
        </>
    );

    return (
        <>
            <InteractionWrapper
                {...props}
                getExtraFlags={(): ColorInputFlags => ({
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
                        getId={props.getId}
                        getAriaLabel={props.getAriaLabel}
                        getPopupId={() => popupId}
                        getIsOpen={getIsOpen}
                        getFlags={getFlags}
                        renderContent={props.renderContent}
                        onToggle={() => setIsOpen((prev) => !prev)}
                        onMouseEnter={props.onMouseEnter}
                        onMouseLeave={props.onMouseLeave}
                    />
                )}
            />

            <Popover
                getId={() => popupId}
                getRole={() => "dialog"}
                getAriaAttributes={() => ({ "aria-label": props.getAriaLabel?.() })}
                getIsOpen={getIsOpen}
                getAnchorRef={getFieldRef}
                getPlacement={() => props.getPlacement?.() ?? DEFAULT_COLOR_INPUT_PLACEMENT}
                getOffset={props.getOffset}
                getTransitionDurationMs={props.getTransitionDurationMs}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderSurface, hsvSignal, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </>
    );
};
