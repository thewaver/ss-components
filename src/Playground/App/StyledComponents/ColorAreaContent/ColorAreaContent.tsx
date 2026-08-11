import type { JSX, ParentProps, Signal } from "solid-js";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import type { ColorValueHsv } from "../../../../Lib/Abstracts/ColorValue/ColorValue.types";
import { ColorValueUtils } from "../../../../Lib/Abstracts/ColorValue/ColorValue.utils";
import { PageColorChannels } from "../../StyledComponents/ColorChannels/ColorChannels";
import type {
    ColorAreaContentProps,
    ColorFieldTriggerProps,
    ColorSwatchProps,
    HueSliderProps,
} from "./ColorAreaContent.types";

import * as styles from "./ColorAreaContent.css";

const PERCENT = 100;

export const PageColorAreaContent = (props: ColorAreaContentProps) => (
    <div
        class={styles.colorAreaSquare}
        classList={{
            [styles.isDragging]: props.getFlags().isDragging,
            [styles.isFocused]: props.getFlags().focusedAxis !== undefined,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        style={{
            ...assignInlineVars({
                [styles.hueVar]: `${props.getFlags().hsv.h}deg`,
                [styles.thumbXVar]: `${props.getFlags().hsv.s * PERCENT}%`,
                [styles.thumbYVar]: `${(1 - props.getFlags().hsv.v) * PERCENT}%`,
            }),
            height: `${props.getSize()}px`,
        }}
    >
        <div class={styles.colorAreaThumb} />
    </div>
);

const HUE_THUMB_SIZE = 18;
const AREA_SIZE = 160;
const HUE_MAX = 360;

export const PageHueSlider = (props: HueSliderProps) => (
    <div class={styles.hueSlider}>
        <div class={styles.hueTrack} />

        <div
            class={styles.hueThumb}
            classList={{ [styles.isFocused]: props.getFlags().focusedThumb === 0 }}
            style={{
                ...assignInlineVars({
                    [styles.swatchVar]: `hsl(${props.getFlags().values[0] % HUE_MAX} 100% 50%)`,
                }),
                left: `calc(${props.getFlags().ratios[0]} * (100% - ${HUE_THUMB_SIZE}px))`,
            }}
        />
    </div>
);

export const PageColorSwatch = (props: ColorSwatchProps) => (
    <div class={styles.colorSwatchChecker}>
        <div class={styles.colorSwatch} style={assignInlineVars({ [styles.swatchVar]: props.getValue() })} />
    </div>
);

export const PageColorChannelGrid = (props: ParentProps) => <div class={styles.colorChannels}>{props.children}</div>;

export const PageColorChannel = (props: ParentProps<{ label: string }>) => (
    <div class={styles.colorChannel}>
        <div class={styles.colorChannelLabel} aria-hidden>
            {props.label}
        </div>

        {props.children}
    </div>
);

export const PageColorPickerPopup = (props: ParentProps) => <div class={styles.colorPickerPopup}>{props.children}</div>;

export const PageColorPickerRow = (props: ParentProps) => <div class={styles.colorPickerRow}>{props.children}</div>;

export const PageColorFieldTrigger = (props: ParentProps<ColorFieldTriggerProps>) => (
    <div
        class={styles.colorFieldTrigger}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}
    </div>
);

export const PageColorPreview = (props: ColorSwatchProps) => (
    <div class={styles.colorPreviewChecker}>
        <div class={styles.colorPreview} style={assignInlineVars({ [styles.swatchVar]: props.getValue() })} />
    </div>
);

export const pageColorPickerSlots = {
    renderArea: (getFlags: Parameters<typeof PageColorAreaContent>[0]["getFlags"]) => (
        <PageColorAreaContent getFlags={getFlags} getSize={() => AREA_SIZE} />
    ),
    renderHue: (getFlags: Parameters<typeof PageHueSlider>[0]["getFlags"]) => <PageHueSlider getFlags={getFlags} />,
    renderPopup: (renderSurface: () => JSX.Element, hsvSignal: Signal<ColorValueHsv>) => (
        <PageColorPickerPopup>
            <PageColorPreview getValue={() => ColorValueUtils.toCssColor(hsvSignal[0]())} />

            {renderSurface()}

            <PageColorChannels hsvSignal={hsvSignal} />
        </PageColorPickerPopup>
    ),
};
