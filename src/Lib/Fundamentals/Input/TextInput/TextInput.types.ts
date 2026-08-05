import type { JSX, Signal } from "solid-js";

import type { CSSPadding } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type TextInputType = "text" | "email" | "number" | "password" | "search" | "tel" | "url";

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
    computeTextStyle?: (getFlags: () => InteractionFlags) => TextInputTextStyle;
    renderPlaceholder?: (getFlags: () => InteractionFlags) => JSX.Element;
    renderLeading?: (getFlags: () => InteractionFlags) => JSX.Element;
    renderTrailing?: (getFlags: () => InteractionFlags) => JSX.Element;
    onInput?: (value: string) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type TextInputState = {
    type?: TextInputType;
    name?: string;
    ariaLabel?: string;
    autoComplete?: JSX.HTMLAutocomplete;
    inputMode?: TextInputMode;
    min?: number;
    max?: number;
    step?: number;
};

export type TextInputElementProps = AccessorProps<
    TextInputCbs &
        InteractionControlProps &
        TextInputState & {
            value: string;
            textInset: JSX.CSSProperties;
            spreadPadding: CSSPadding;
            setLeadingRef: (element: HTMLElement) => void;
            setTrailingRef: (element: HTMLElement) => void;
        }
>;

export type TextInputProps = Omit<InteractionWrapperProps, "renderControl" | "getIsEmpty" | "getMinWidth"> &
    AccessorProps<
        TextInputCbs &
            Pick<InteractionControlProps, "id" | "renderContent"> &
            TextInputState & {
                padding?: CSSPadding | number;
                gap?: number;
                valueSignal: Signal<string>;
            }
    >;
