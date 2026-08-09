import { createRenderEffect, createSignal } from "solid-js";

export type TextSyncElement = HTMLInputElement | HTMLTextAreaElement;

export namespace TextSync {
    export const createValueSync = (
        getRef: () => TextSyncElement | undefined,
        getValue: () => string,
        opts: {
            onInput: (value: string) => void;
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

        return {
            handleInput: (element: TextSyncElement) => {
                if (getIsComposing()) return;

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
