import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type ColorInputFlags = {
    value: string;
};

export type ColorInputCbs = {
    onInput?: (value: string) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type ColorInputState = {
    name?: string;
    ariaLabel?: string;
};

export type ColorInputElementProps = AccessorProps<
    ColorInputCbs & InteractionControlProps<ColorInputFlags> & ColorInputState & { value: string }
>;

export type ColorInputProps = Omit<InteractionWrapperProps<ColorInputFlags>, "renderControl" | "getExtraFlags"> &
    AccessorProps<
        ColorInputCbs &
            Pick<InteractionControlProps<ColorInputFlags>, "id" | "renderContent"> &
            ColorInputState & {
                valueSignal: Signal<string>;
            }
    >;
