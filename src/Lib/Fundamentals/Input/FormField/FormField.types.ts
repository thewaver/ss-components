import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";

export type FormFieldState = {
    hasError: boolean;
    hasMessage: boolean;
};

export type FormFieldProps = AccessorProps<{
    dir?: "column" | "row";
    gap?: number;
    hasError?: boolean;
    message?: string;
    renderCaption?: (getState: () => FormFieldState) => JSX.Element;
    renderMessage?: (getState: () => FormFieldState) => JSX.Element;
    renderControl: (getState: () => FormFieldState) => JSX.Element;
}>;
