import { For } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { RangeContentProps } from "./RangeContent.types";

import * as styles from "./RangeContent.css";

const DEFAULT_RANGE_CONTENT_LENGTH = styles.RANGE_LENGTH;

const travel = (ratio: number) => `calc(${ratio} * (100% - ${styles.RANGE_THUMB_SIZE}px))`;

const centre = (ratio: number) =>
    `calc(${ratio} * (100% - ${styles.RANGE_THUMB_SIZE}px) + ${styles.RANGE_THUMB_SIZE / 2}px)`;

export const PageRangeContent = (props: RangeContentProps) => {
    const getOrientation = () => access(props.flags).orientation;

    const getLength = () => access(props.length) ?? DEFAULT_RANGE_CONTENT_LENGTH;

    const getFillSpan = () => {
        const fill = access(props.flags).fill;

        return travel(fill.end - fill.start);
    };

    return (
        <div
            class={[styles.rangeContent, styles.rangeContentVariants[getOrientation()]].join(" ")}
            style={getOrientation() === "vertical" ? { height: `${getLength()}px` } : { width: `${getLength()}px` }}
            classList={{ [styles.isDisabled]: access(props.flags).isDisabled }}
        >
            <div class={[styles.rangeTrack, styles.rangeTrackVariants[getOrientation()]].join(" ")} />

            <div
                class={[styles.rangeFill, styles.rangeFillVariants[getOrientation()]].join(" ")}
                classList={{ [styles.hasError]: access(props.flags).hasError }}
                style={
                    getOrientation() === "vertical"
                        ? { bottom: centre(access(props.flags).fill.start), height: getFillSpan() }
                        : { left: centre(access(props.flags).fill.start), width: getFillSpan() }
                }
            />

            <For each={access(props.flags).ratios}>
                {(ratio, getIndex) => (
                    <div
                        class={[styles.rangeThumb, styles.rangeThumbVariants[getOrientation()]].join(" ")}
                        classList={{
                            [styles.isFocused]: access(props.flags).focusedThumb === getIndex(),
                            [styles.hasError]: access(props.flags).hasError,
                        }}
                        style={getOrientation() === "vertical" ? { bottom: travel(ratio) } : { left: travel(ratio) }}
                    />
                )}
            </For>
        </div>
    );
};
