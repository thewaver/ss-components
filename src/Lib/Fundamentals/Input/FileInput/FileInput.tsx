import { createRenderEffect, createSignal } from "solid-js";

import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import { FormFieldUtils } from "../FormField/FormField.utils";
import { LabelUtils } from "../Label/Label.utils";
import type { FileInputElementProps, FileInputFlags, FileInputProps } from "./FileInput.types";

import * as styles from "./FileInput.css";

const EMPTY_FILE_INPUT_VALUE = "";

const FileInputElement = (props: FileInputElementProps) => {
    const getAriaLabel = LabelUtils.resolveAriaLabel(
        props.ariaLabel === undefined ? undefined : () => access(props.ariaLabel)!,
    );
    const getAriaDescribedBy = FormFieldUtils.resolveAriaDescribedBy();

    const [getElementRef, setElementRef] = createSignal<HTMLInputElement>();

    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const syncElement = (element: HTMLInputElement) => {
        if (access(props.files).length) return;

        element.value = EMPTY_FILE_INPUT_VALUE;
    };

    createRenderEffect(() => {
        const element = getElementRef();

        if (!element) return;

        syncElement(element);
    });

    return (
        <>
            {props.renderContent(() => access(props.flags))}

            <input
                id={access(props.id)}
                ref={(element) => {
                    setElementRef(element);
                    props.ref?.(element);
                }}
                type="file"
                name={access(props.name)}
                class={styles.fileInputElement}
                accept={access(props.accept)}
                multiple={access(props.isMultiple)}
                aria-label={getAriaLabel()}
                aria-describedby={getAriaDescribedBy()}
                aria-disabled={getIsDisabled() || undefined}
                aria-invalid={access(props.flags).hasError || undefined}
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

export const FileInput = (props: FileInputProps) => {
    return (
        <InteractionWrapper
            {...props}
            extraFlags={(): FileInputFlags => ({ files: props.filesSignal[0]() })}
            renderControl={(setElementRef, getFlags) => (
                <FileInputElement
                    ref={setElementRef}
                    id={props.id}
                    name={props.name}
                    ariaLabel={props.ariaLabel}
                    accept={props.accept}
                    isMultiple={props.isMultiple}
                    flags={getFlags}
                    files={() => props.filesSignal[0]()}
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
};
