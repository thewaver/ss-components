import { Index, Show, createMemo } from "solid-js";

import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import type { TagInputProps } from "./TagInput.types";

import * as styles from "./TagInput.css";

const DEFAULT_TAG_INPUT_GAP = 5;
const DEFAULT_TAG_INPUT_PADDING = 0;

export const TagInput = (props: TagInputProps) => {
    let fieldRef: HTMLInputElement | undefined;
    let tagRefs: (HTMLElement | undefined)[] = [];

    const textSignal = SignalMirror.createOptional(() => props.textSignal, "");

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getTags = () => props.valueSignal[0]();

    const getIsEmpty = createMemo(() => textSignal[0]().length < 1);

    const setTags = (tags: string[]) => {
        props.valueSignal[1](() => tags);

        void props.onTagsChange?.(tags);
    };

    const focusTag = (index: number) => {
        tagRefs[index]?.focus();
    };

    const focusField = () => {
        fieldRef?.focus();
    };

    const addTag = () => {
        const text = textSignal[0]();
        const tag = props.computeTag ? props.computeTag(text) : text.trim();

        if (!tag) return;

        setTags([...getTags(), tag]);
        textSignal[1]("");
    };

    const removeTag = (index: number) => {
        const tags = getTags();

        setTags(tags.filter((_, position) => position !== index));

        if (index > 0) {
            focusTag(index - 1);
            return;
        }

        if (tags.length > 1) {
            focusTag(0);
            return;
        }

        focusField();
    };

    const handleFieldKeyDown = (e: KeyboardEvent) => {
        if (getIsDisabled()) return;

        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
            return;
        }

        if (!getIsEmpty() || getTags().length < 1) return;

        if (e.key === "Backspace" || e.key === "ArrowLeft") {
            e.preventDefault();
            focusTag(getTags().length - 1);
        }
    };

    const handleTagKeyDown = (e: KeyboardEvent, index: number) => {
        if (getIsDisabled()) return;

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            focusField();
            return;
        }

        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            removeTag(index);
            return;
        }

        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusTag(index - 1);
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();

            if (index < getTags().length - 1) {
                focusTag(index + 1);
                return;
            }

            focusField();
        }
    };

    return (
        <InteractionWrapper
            {...props}
            extraFlags={() => ({ isEmpty: getIsEmpty(), hasTags: getTags().length > 0 })}
            renderControl={(setElementRef, getFlags) => (
                <>
                    {props.renderContent?.(getFlags)}

                    <div
                        class={styles.tagInputRoot}
                        style={{
                            gap: `${access(props.gap) ?? DEFAULT_TAG_INPUT_GAP}px`,
                            padding: `${access(props.padding) ?? DEFAULT_TAG_INPUT_PADDING}px`,
                        }}
                        role="group"
                        aria-label={access(props.ariaLabel)}
                        onPointerDown={(e) => {
                            if (e.target !== e.currentTarget) return;

                            e.preventDefault();
                            focusField();
                        }}
                    >
                        <Index each={getTags()}>
                            {(getTag, index) => (
                                <InteractionWrapper
                                    isDisabled={() => getFlags().isDisabled ?? false}
                                    renderControl={(setTagRef, getTagFlags) => (
                                        <button
                                            type="button"
                                            ref={(element) => {
                                                tagRefs[index] = element;
                                                setTagRef(element);
                                            }}
                                            class={styles.tagInputTag}
                                            tabindex={-1}
                                            aria-label={props.computeTagAriaLabel?.(getTag()) ?? getTag()}
                                            aria-disabled={getTagFlags().isDisabled || undefined}
                                            onClick={() => {
                                                if (getTagFlags().isDisabled) return;

                                                removeTag(index);
                                            }}
                                            onKeyDown={(e) => handleTagKeyDown(e, index)}
                                        >
                                            {props.renderTag(getTag, getTagFlags)}
                                        </button>
                                    )}
                                />
                            )}
                        </Index>

                        <input
                            ref={(element) => {
                                fieldRef = element;
                                setElementRef(element);
                            }}
                            id={access(props.id)}
                            type="text"
                            name={access(props.name)}
                            class={styles.tagInputField}
                            style={props.computeTextStyle?.(getFlags)}
                            value={textSignal[0]()}
                            readOnly={getFlags().isDisabled}
                            aria-label={access(props.ariaLabel)}
                            aria-disabled={getFlags().isDisabled || undefined}
                            onInput={(e) => textSignal[1](e.currentTarget.value)}
                            onKeyDown={handleFieldKeyDown}
                        />

                        <Show when={props.renderPlaceholder && getIsEmpty() && getTags().length < 1}>
                            <div class={styles.tagInputPlaceholder}>{props.renderPlaceholder!(getFlags)}</div>
                        </Show>
                    </div>
                </>
            )}
        />
    );
};
