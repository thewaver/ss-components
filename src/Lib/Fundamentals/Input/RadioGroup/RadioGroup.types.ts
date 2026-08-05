import type { ParentProps, Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";

export type RadioGroupDir = "column" | "row";

export type RadioGroupProps<T> = ParentProps<
    AccessorProps<{
        dir?: RadioGroupDir;
        gap?: number;
        name?: string;
        ariaLabel?: string;
        hasError?: boolean;
    }> & { valueSignal: Signal<T> }
>;
