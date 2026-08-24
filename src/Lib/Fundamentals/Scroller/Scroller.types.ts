import type { Accessor, JSX, ParentProps, Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type ScrollerStep = "previous" | "next";

export type ScrollerButtonPlacement = "split" | "start" | "end";

export type ScrollerStepper = {
    getIsAtStart: () => boolean;
    getIsAtEnd: () => boolean;
    stepToPrevious: () => void;
    stepToNext: () => void;
};

export type ScrollerProps = ParentProps<
    AccessorProps<{
        gap?: number;
        padding?: number;
        buttonPlacement?: ScrollerButtonPlacement;
    }> & {
        progressSignal?: Signal<number>;
        renderButton: (getStep: Accessor<ScrollerStep>, stepper: ScrollerStepper) => JSX.Element;
    }
>;
