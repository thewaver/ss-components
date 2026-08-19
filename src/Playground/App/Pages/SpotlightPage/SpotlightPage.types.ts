import type { Signal } from "solid-js";

export type SpotlightHintExampleProps = {
    visibilitySignal: Signal<boolean>;
    getIndex: () => number;
    onIndexChange: (index: number) => void;
};

export type SpotlightPromptExampleProps = {
    visibilitySignal: Signal<boolean>;
    onBuy: () => void;
};

export type SpotlightGuideExampleProps = {
    visibilitySignal: Signal<boolean>;
    getStep: () => number;
    onStepChange: (step: number) => void;
    onStart: () => void;
    onEnd: (reason: string) => void;
};
