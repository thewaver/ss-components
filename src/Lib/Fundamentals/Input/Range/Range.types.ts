import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type RangeOrientation = "horizontal" | "vertical";

export type RangeValues = {
    start: number;
    end: number;
};

export type RangeSpan = {
    start: number;
    end: number;
};

export type RangeFlags = {
    orientation: RangeOrientation;
    values: number[];
    ratios: number[];
    fill: RangeSpan;
    focusedThumb?: number;
};

export type RangeCbs = {
    onInput?: (values: number[]) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type RangeState = {
    name?: string;
    ariaLabel?: string;
    thumbLabels?: string[];
    orientation?: RangeOrientation;
    min?: number;
    max?: number;
    step?: number;
    thumbSize?: number;
};

export type RangeElementProps = AccessorProps<
    RangeCbs &
        InteractionControlProps<RangeFlags> &
        Required<Omit<RangeState, "name" | "ariaLabel" | "thumbLabels">> &
        Pick<RangeState, "name" | "ariaLabel" | "thumbLabels"> & {
            values: number[];
            isTabbable?: boolean;
            setValue: (index: number, value: number) => void;
            setFocusedThumb: (index?: number) => void;
        }
>;

export type RangeProps = Omit<InteractionWrapperProps<RangeFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        RangeCbs &
            Pick<InteractionControlProps<RangeFlags>, "id" | "renderContent"> &
            RangeState & {
                valueSignal?: Signal<number>;
                rangeSignal?: Signal<RangeValues>;
            }
    >;
