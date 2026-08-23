import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SpotlightHintExampleProps = AccessorProps<{
    visibilitySignal: Signal<boolean>;
    index: number;
    onIndexChange: (index: number) => void;
}>;

export type SpotlightPromptExampleProps = {
    visibilitySignal: Signal<boolean>;
    onBuy: () => void;
};

export type SpotlightGuideExampleProps = AccessorProps<{
    visibilitySignal: Signal<boolean>;
    step: number;
    onStepChange: (step: number) => void;
    onStart: () => void;
    onEnd: (reason: string) => void;
}>;
