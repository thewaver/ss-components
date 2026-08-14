import { createRenderEffect, createSignal } from "solid-js";

import type { TextSyncMaskResult } from "./TextSync.utils";

export type TextSyncElement = HTMLInputElement | HTMLTextAreaElement;

export namespace TextSync {
    export const createValueSync = (
        getRef: () => TextSyncElement | undefined,
        getValue: () => string,
        opts: {
            onInput: (value: string) => void;
            computeMaskedText?: (previous: string, next: string, caret: number) => TextSyncMaskResult;
        },
    ) => {
        const [getIsComposing, setIsComposing] = createSignal(false);

        const syncElement = (element: TextSyncElement) => {
            const value = getValue();

            if (getIsComposing() || element.value === value) return;

            const { selectionStart, selectionEnd } = element;

            element.value = value;

            if (selectionStart === null || selectionEnd === null) return;

            element.setSelectionRange(selectionStart, selectionEnd);
        };

        const reportValue = (element: TextSyncElement) => {
            opts.onInput(element.value);

            syncElement(element);
        };

        createRenderEffect(() => {
            const element = getRef();

            if (!element) return;

            syncElement(element);
        });

        const reportMaskedValue = (
            element: TextSyncElement,
            computeMaskedText: (previous: string, next: string, caret: number) => TextSyncMaskResult,
        ) => {
            const hasSelection = element.selectionStart !== null;
            const { text, caret } = computeMaskedText(
                getValue(),
                element.value,
                element.selectionStart ?? element.value.length,
            );

            element.value = text;

            if (hasSelection) element.setSelectionRange(caret, caret);

            opts.onInput(text);
        };

        return {
            handleInput: (element: TextSyncElement) => {
                if (getIsComposing()) return;

                if (opts.computeMaskedText) {
                    reportMaskedValue(element, opts.computeMaskedText);

                    return;
                }

                reportValue(element);
            },
            handleCompositionStart: () => {
                setIsComposing(true);
            },
            handleCompositionEnd: (element: TextSyncElement) => {
                opts.onInput(element.value);

                setIsComposing(false);
            },
        };
    };
}
