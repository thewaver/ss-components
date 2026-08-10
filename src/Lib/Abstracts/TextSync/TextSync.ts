import { createRenderEffect, createSignal } from "solid-js";

import { TextSyncUtils } from "./TextSync.utils";

export type TextSyncElement = HTMLInputElement | HTMLTextAreaElement;

export namespace TextSync {
    export const createValueSync = (
        getRef: () => TextSyncElement | undefined,
        getValue: () => string,
        opts: {
            onInput: (value: string) => void;
            getMask?: () => string | undefined;
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

        /**
         * A mask owns the caret, which is why it lives here rather than in a transforming setter. The owner's
         * setter runs after the text has already been written, so it can refuse or correct a value — but it
         * cannot move a caret it never saw, and a caret left where the keystroke put it lands before the
         * separator the mask just inserted.
         */
        const reportMaskedValue = (element: TextSyncElement, mask: string) => {
            const hasSelection = element.selectionStart !== null;
            const { text, caret } = TextSyncUtils.applyMask(
                mask,
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

                const mask = opts.getMask?.();

                if (mask !== undefined) {
                    reportMaskedValue(element, mask);

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
