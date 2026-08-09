import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageNumberFieldProps = AccessorProps<{
    value: number;
    min?: number;
    max?: number;
    step?: number;
    width?: number;
    isDisabled?: boolean;
    ariaLabel?: string;
    onInput: (value: number) => void;
}>;

export type PageTextFieldProps = AccessorProps<{
    value: string;
    width?: number;
    isDisabled?: boolean;
    ariaLabel?: string;
    placeholder?: string;
    onInput: (value: string) => void;
}>;

export type PageCheckFieldProps = AccessorProps<{
    value: boolean;
    isDisabled?: boolean;
    ariaLabel?: string;
    onChange: (value: boolean) => void;
}>;

export type PageColorFieldProps = AccessorProps<{
    value: string;
    isDisabled?: boolean;
    ariaLabel?: string;
    onInput: (value: string) => void;
}>;

export type PageFileFieldProps = AccessorProps<{
    accept?: string;
    isDisabled?: boolean;
    ariaLabel?: string;
    onPick: (file: File) => void;
}>;

/**
 * Declared by hand rather than through `AccessorProps`, because a generic prop cannot pass through it
 * — the key filter cannot resolve while `T` is unbound and the prop silently vanishes.
 */
export type PageSelectFieldProps<T> = {
    getValue: () => T;
    getValues: () => readonly T[];
    getWidth?: () => number;
    getIsDisabled?: () => boolean;
    getAriaLabel?: () => string;
    computeLabel?: (value: T) => string;
    onChange: (value: T) => void;
};

export type PageGroupedSelectFieldProps<T> = Omit<PageSelectFieldProps<T>, "getValues"> & {
    getGroups: () => readonly (readonly [string, readonly T[]])[];
};
