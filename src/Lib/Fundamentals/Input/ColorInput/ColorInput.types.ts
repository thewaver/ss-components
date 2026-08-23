import type { JSX, Signal } from "solid-js";

import type { Color } from "@thewaver/ss-utils";
import type { Point2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";
import type { ColorAreaFlags } from "../ColorArea/ColorArea.types";
import type { RangeFlags } from "../Range/Range.types";

export type ColorInputFlags = {
    value: string;
    hsv: Color.HSVA;
    isOpen: boolean;
};

export type ColorInputCbs = {
    onInput?: (value: string) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type ColorInputState = {
    name?: string;
    ariaLabel?: string;
    areaLabel?: string;
    hueLabel?: string;
    placement?: AnchorPlacement;
    offset?: Point2d;
    transitionDurationMs?: number;
};

export type ColorInputFieldProps = AccessorProps<
    ColorInputCbs &
        InteractionControlProps<ColorInputFlags> &
        Pick<ColorInputState, "ariaLabel"> & {
            popupId: string;
            isOpen: boolean;
            onToggle: () => void;
        }
>;

export type ColorInputProps = Omit<InteractionWrapperProps<ColorInputFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        ColorInputCbs &
            Pick<InteractionControlProps<ColorInputFlags>, "id" | "renderContent"> &
            ColorInputState & {
                valueSignal: Signal<string>;
            }
    > & {
        visibilitySignal?: Signal<boolean>;
        renderArea: (getFlags: () => InteractionFlags<ColorAreaFlags>) => JSX.Element;
        renderHue: (getFlags: () => InteractionFlags<RangeFlags>) => JSX.Element;
        renderPopup: (
            renderSurface: () => JSX.Element,
            hsvSignal: Signal<Color.HSVA>,
            getVisibilityTarget: () => 0 | 1,
            getTransitionDurationMs: () => number,
        ) => JSX.Element;
    };
