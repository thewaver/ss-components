import { For } from "solid-js";

import type { RangeContentProps } from "./RangeContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./RangeContent.css";

const DEFAULT_RANGE_CONTENT_LENGTH = styles.RANGE_LENGTH;

const travel = (ratio: number) => `calc(${ratio} * (100% - ${styles.RANGE_THUMB_SIZE}px))`;

const centre = (ratio: number) =>
    `calc(${ratio} * (100% - ${styles.RANGE_THUMB_SIZE}px) + ${styles.RANGE_THUMB_SIZE / 2}px)`;

export const PageRangeContent = (props: RangeContentProps) => {
    const getOrientation = () => props.getFlags().orientation;

    const getLength = () => props.getLength?.() ?? DEFAULT_RANGE_CONTENT_LENGTH;

    const getFillSpan = () => {
        const fill = props.getFlags().fill;

        return travel(fill.end - fill.start);
    };

    return (
        <div
            class={[styles.rangeContent, styles.rangeContentVariants[getOrientation()]].join(" ")}
            style={getOrientation() === "vertical" ? { height: `${getLength()}px` } : { width: `${getLength()}px` }}
            classList={{ [pageStyles.isDisabled]: props.getFlags().isDisabled }}
        >
            <div class={[styles.rangeTrack, styles.rangeTrackVariants[getOrientation()]].join(" ")} />

            <div
                class={[styles.rangeFill, styles.rangeFillVariants[getOrientation()]].join(" ")}
                classList={{ [pageStyles.hasError]: props.getFlags().hasError }}
                style={
                    getOrientation() === "vertical"
                        ? { bottom: centre(props.getFlags().fill.start), height: getFillSpan() }
                        : { left: centre(props.getFlags().fill.start), width: getFillSpan() }
                }
            />

            <For each={props.getFlags().ratios}>
                {(ratio, getIndex) => (
                    <div
                        class={[styles.rangeThumb, styles.rangeThumbVariants[getOrientation()]].join(" ")}
                        classList={{
                            [styles.isFocused]: props.getFlags().focusedThumb === getIndex(),
                            [pageStyles.hasError]: props.getFlags().hasError,
                        }}
                        style={getOrientation() === "vertical" ? { bottom: travel(ratio) } : { left: travel(ratio) }}
                    />
                )}
            </For>
        </div>
    );
};
