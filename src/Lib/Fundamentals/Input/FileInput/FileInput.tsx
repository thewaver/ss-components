import { createRenderEffect, createSignal } from "solid-js";

import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { LabelUtils } from "../Label/Label.utils";
import type { FileInputElementProps, FileInputFlags, FileInputProps } from "./FileInput.types";

import * as styles from "./FileInput.css";

const EMPTY_FILE_INPUT_VALUE = "";

const FileInputElement = (props: FileInputElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(props.getAriaLabel);

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    /**
     * A `FileList` cannot be constructed, so the only state the DOM can be pushed back into is the
     * empty one — which is the state that matters. An owner that rejects a pick and writes `[]` back
     * would otherwise leave the input holding the file, and re-picking the same file then fires no
     * `change` event at all, so the user cannot retry the thing they were just told to fix.
     */
    const syncElement = (element: HTMLInputElement) => {
        if (props.getFiles().length) return;

        element.value = EMPTY_FILE_INPUT_VALUE;
    };

    createRenderEffect(() => {
        const element = getElementRef();

        if (!element) return;

        syncElement(element);
    });

    return (
        <>
            {props.renderContent(props.getFlags)}

            <input
                id={props.getId?.()}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type="file"
                name={props.getName?.()}
                class={styles.fileInputElement}
                accept={props.getAccept?.()}
                multiple={props.getIsMultiple?.()}
                aria-label={getAriaLabel()}
                aria-disabled={getIsDisabled() || undefined}
                aria-invalid={props.getFlags().hasError || undefined}
                onClick={(e) => {
                    if (getIsDisabled()) e.preventDefault();
                }}
                onChange={(e) => {
                    const element = e.currentTarget;

                    if (getIsDisabled()) return;

                    void props.onChange?.(Array.from(element.files ?? []));

                    syncElement(element);
                }}
                onMouseEnter={(e) => {
                    if (getIsDisabled()) return;

                    void props.onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    if (getIsDisabled()) return;

                    void props.onMouseLeave?.(e);
                }}
            />
        </>
    );
};

export const FileInput = (props: FileInputProps) => (
    <InteractionWrapper
        {...props}
        getExtraFlags={(): FileInputFlags => ({ files: props.filesSignal[0]() })}
        renderControl={(setElementRef, getFlags) => (
            <FileInputElement
                ref={setElementRef}
                getId={props.getId}
                getName={props.getName}
                getAriaLabel={props.getAriaLabel}
                getAccept={props.getAccept}
                getIsMultiple={props.getIsMultiple}
                getFlags={getFlags}
                getFiles={() => props.filesSignal[0]()}
                renderContent={props.renderContent}
                onChange={(files) => {
                    props.filesSignal[1](files);

                    void props.onChange?.(files);
                }}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            />
        )}
    />
);
