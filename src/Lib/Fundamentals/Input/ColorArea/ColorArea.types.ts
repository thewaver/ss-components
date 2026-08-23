import type { Signal } from "solid-js";

import type { Color } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type ColorAreaAxis = "saturation" | "brightness";

export type ColorAreaFlags = {
    hsv: Color.HSVA;
    isDragging: boolean;
    focusedAxis?: ColorAreaAxis;
};

export type ColorAreaCbs = {
    onInput?: (hsv: Color.HSVA) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type ColorAreaState = {
    name?: string;
    ariaLabel?: string;
    axisLabels?: Record<ColorAreaAxis, string>;
    step?: number;
};

export type ColorAreaElementProps = AccessorProps<
    ColorAreaCbs &
        InteractionControlProps<ColorAreaFlags> &
        Required<Omit<ColorAreaState, "name" | "ariaLabel">> &
        Pick<ColorAreaState, "name" | "ariaLabel"> & {
            hsv: Color.HSVA;
            isTabbable?: boolean;
            setAxis: (axis: ColorAreaAxis, ratio: number) => void;
            setFocusedAxis: (axis?: ColorAreaAxis) => void;
            setIsDragging: (isDragging: boolean) => void;
        }
>;

export type ColorAreaProps = Omit<InteractionWrapperProps<ColorAreaFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        ColorAreaCbs &
            Pick<InteractionControlProps<ColorAreaFlags>, "id" | "renderContent"> &
            ColorAreaState & {
                hsvSignal: Signal<Color.HSVA>;
            }
    >;
