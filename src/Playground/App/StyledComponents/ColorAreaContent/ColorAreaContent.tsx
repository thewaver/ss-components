import type { JSX, ParentProps, Signal } from "solid-js";

import { Color } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { access } from "../../../../Lib/Utils/propUtils";
import { PageColorChannels } from "../../StyledComponents/ColorChannels/ColorChannels";
import type {
    ColorAreaContentProps,
    ColorFieldTriggerProps,
    ColorSwatchProps,
    HueSliderProps,
} from "./ColorAreaContent.types";

import * as styles from "./ColorAreaContent.css";

const PERCENT = 100;

export const PageColorAreaContent = (props: ColorAreaContentProps) => {
    return (
        <div
            class={styles.colorAreaSquare}
            classList={{
                [styles.isDragging]: access(props.flags).isDragging,
                [styles.isFocused]: access(props.flags).focusedAxis !== undefined,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            style={{
                ...assignInlineVars({
                    [styles.hueVar]: `${access(props.flags).hsv.h}deg`,
                    [styles.thumbXVar]: `${access(props.flags).hsv.s * PERCENT}%`,
                    [styles.thumbYVar]: `${(1 - access(props.flags).hsv.v) * PERCENT}%`,
                }),
                height: `${access(props.size)}px`,
            }}
        >
            <div class={styles.colorAreaThumb} />
        </div>
    );
};

const HUE_THUMB_SIZE = 18;
const AREA_SIZE = 160;
const HUE_MAX = 360;

export const PageHueSlider = (props: HueSliderProps) => {
    return (
        <div class={styles.hueSlider}>
            <div class={styles.hueTrack} />

            <div
                class={styles.hueThumb}
                classList={{ [styles.isFocused]: access(props.flags).focusedThumb === 0 }}
                style={{
                    ...assignInlineVars({
                        [styles.swatchVar]: `hsl(${access(props.flags).values[0] % HUE_MAX} 100% 50%)`,
                    }),
                    left: `calc(${access(props.flags).ratios[0]} * (100% - ${HUE_THUMB_SIZE}px))`,
                }}
            />
        </div>
    );
};

export const PageColorSwatch = (props: ColorSwatchProps) => {
    return (
        <div class={styles.colorSwatchChecker}>
            <div class={styles.colorSwatch} style={assignInlineVars({ [styles.swatchVar]: access(props.value) })} />
        </div>
    );
};

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

export const PageColorFieldTrigger = (props: ParentProps<ColorFieldTriggerProps>) => {
    return (
        <div
            class={styles.colorFieldTrigger}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            {props.children}
        </div>
    );
};

export const PageColorPreview = (props: ColorSwatchProps) => {
    return (
        <div class={styles.colorPreviewChecker}>
            <div class={styles.colorPreview} style={assignInlineVars({ [styles.swatchVar]: access(props.value) })} />
        </div>
    );
};

export const pageColorPickerSlots = {
    renderArea: (getFlags: Parameters<typeof PageColorAreaContent>[0]["flags"]) => (
        <PageColorAreaContent flags={getFlags} size={() => AREA_SIZE} />
    ),
    renderHue: (getFlags: Parameters<typeof PageHueSlider>[0]["flags"]) => <PageHueSlider flags={getFlags} />,
    renderPopup: (renderSurface: () => JSX.Element, hsvSignal: Signal<Color.HSVA>) => (
        <PageColorPickerPopup>
            <PageColorPreview value={() => Color.RGBA.toCss(Color.HSVA.toRgba(hsvSignal[0]()))} />

            {renderSurface()}

            <PageColorChannels hsvSignal={hsvSignal} />
        </PageColorPickerPopup>
    ),
};
