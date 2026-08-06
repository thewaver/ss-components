import type { JSX, Signal } from "solid-js";

import type { CSSPadding } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type TextInputType = "text" | "email" | "number" | "password" | "search" | "tel" | "url";

export type TextInputFlags = {
    isEmpty: boolean;
    isReadOnly: boolean;
};

export type TextInputMode = "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";

export type TextInputTextStyle = Pick<
    JSX.CSSProperties,
    | "color"
    | "caret-color"
    | "font-family"
    | "font-size"
    | "font-style"
    | "font-variant-numeric"
    | "font-weight"
    | "letter-spacing"
    | "line-height"
    | "text-align"
    | "text-transform"
    | "word-spacing"
>;

export type TextInputCbs = {
    computeTextStyle?: (getFlags: () => InteractionFlags<TextInputFlags>) => TextInputTextStyle;
    renderPlaceholder?: (getFlags: () => InteractionFlags<TextInputFlags>) => JSX.Element;
    renderLeading?: (getFlags: () => InteractionFlags<TextInputFlags>) => JSX.Element;
    renderTrailing?: (getFlags: () => InteractionFlags<TextInputFlags>) => JSX.Element;
    onInput?: (value: string) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type TextInputState = {
    type?: TextInputType;
    name?: string;
    ariaLabel?: string;
    isReadOnly?: boolean;
    autoComplete?: JSX.HTMLAutocomplete;
    inputMode?: TextInputMode;
    min?: number;
    max?: number;
    step?: number;
};

export type TextInputElementProps = AccessorProps<
    TextInputCbs &
        InteractionControlProps<TextInputFlags> &
        TextInputState & {
            value: string;
            textInset: JSX.CSSProperties;
            spreadPadding: CSSPadding;
            setLeadingRef: (element: HTMLElement) => void;
            setTrailingRef: (element: HTMLElement) => void;
        }
>;

export type TextInputProps = Omit<
    InteractionWrapperProps<TextInputFlags>,
    "renderControl" | "getExtraFlags" | "getMinWidth"
> &
    AccessorProps<
        TextInputCbs &
            Pick<InteractionControlProps<TextInputFlags>, "id" | "renderContent"> &
            TextInputState & {
                padding?: CSSPadding | number;
                gap?: number;
                valueSignal: Signal<string>;
            }
    >;
