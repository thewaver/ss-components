import type { JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type ProgressSizing = "fit-content" | "fill";

export type ProgressState = {
    value: number | undefined;
    min: number;
    max: number;
    ratio: number | undefined;
    hasError: boolean;
};

export type ProgressProps = AccessorProps<{
    id?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaValueText?: string;
    value?: number;
    min?: number;
    max?: number;
    hasError?: boolean;
    sizing?: ProgressSizing;
    renderContent: (getState: () => ProgressState) => JSX.Element;
}>;
