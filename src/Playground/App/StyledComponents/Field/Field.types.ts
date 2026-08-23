import type { AccessorProps, MaybeAccessor } from "../../../../Lib/Utils/typeUtils";

export type PageNumberFieldProps = AccessorProps<{
    id?: string;
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
    onBlur?: () => void;
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

export type PageSelectFieldProps<T> = {
    value: MaybeAccessor<T>;
    values: MaybeAccessor<readonly T[]>;
    computeLabel?: (value: T) => string;
    onChange: (value: T) => void;
} & AccessorProps<{
    width?: number;
    isDisabled?: boolean;
    ariaLabel?: string;
}>;

export type PageGroupedSelectFieldProps<T> = Omit<PageSelectFieldProps<T>, "values"> & {
    groups: MaybeAccessor<readonly (readonly [string, readonly T[]])[]>;
};
