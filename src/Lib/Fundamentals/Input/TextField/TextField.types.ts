import type { JSX, Signal } from "solid-js";

import type { CSSPadding } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { TextSyncMaskResult } from "../../../Abstracts/TextSync/TextSync.utils";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type TextFieldElementType = "input" | "textarea";

export type TextFieldType = "text" | "email" | "number" | "password" | "search" | "tel" | "url";

export type TextFieldFlags = {
    isEmpty: boolean;
    isReadOnly: boolean;
};

export type TextFieldMode = "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";

export type TextFieldTextStyle = Pick<
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

export type TextFieldCbs = {
    computeMaskedText?: (previous: string, next: string, caret: number) => TextSyncMaskResult;
    computeTextStyle?: (getFlags: () => InteractionFlags<TextFieldFlags>) => TextFieldTextStyle;
    renderPlaceholder?: (getFlags: () => InteractionFlags<TextFieldFlags>, hint: string | undefined) => JSX.Element;
    renderLeading?: (getFlags: () => InteractionFlags<TextFieldFlags>) => JSX.Element;
    renderTrailing?: (getFlags: () => InteractionFlags<TextFieldFlags>) => JSX.Element;
    onInput?: (value: string) => void | Promise<void>;
    onKeyDown?: (e: KeyboardEvent) => void | Promise<void>;
    onBlur?: () => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type TextFieldState = {
    element: TextFieldElementType;
    type?: TextFieldType;
    name?: string;
    ariaLabel?: string;
    isReadOnly?: boolean;
    isSpinButton?: boolean;
    autoComplete?: JSX.HTMLAutocomplete;
    inputMode?: TextFieldMode;
    placeholderHint?: string;
    min?: number;
    max?: number;
    step?: number;
    isAutoSizing?: boolean;
    minRows?: number;
    maxRows?: number;
};

export type TextFieldElementProps = AccessorProps<
    TextFieldCbs &
        InteractionControlProps<TextFieldFlags> &
        TextFieldState & {
            value: string;
            textInset: JSX.CSSProperties;
            spreadPadding: CSSPadding;
            setLeadingRef: (element: HTMLElement) => void;
            setTrailingRef: (element: HTMLElement) => void;
        }
>;

export type TextFieldProps = Omit<
    InteractionWrapperProps<TextFieldFlags>,
    "renderControl" | "extraFlags" | "minWidth" | "minHeight"
> &
    AccessorProps<
        TextFieldCbs &
            Pick<InteractionControlProps<TextFieldFlags>, "id" | "renderContent"> &
            TextFieldState & {
                padding?: CSSPadding | number;
                gap?: number;
                valueSignal: Signal<string>;
            }
    >;

export type TextFieldPresetProps = Omit<
    TextFieldProps,
    "element" | "isSpinButton" | "isAutoSizing" | "minRows" | "maxRows" | "onKeyDown" | "onBlur"
>;
