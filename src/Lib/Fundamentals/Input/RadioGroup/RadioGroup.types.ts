import type { JSX, ParentProps, Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";

export type RadioGroupDir = "column" | "row";

export type RadioGroupProps<T> = ParentProps<
    AccessorProps<{
        dir?: RadioGroupDir;
        gap?: number;
        name?: string;
        ariaLabel?: string;
        hasError?: boolean;
        transitionDurationMs?: number;
    }> & {
        valueSignal: Signal<T>;
        renderFloater?: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    }
>;
