import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { SlideButtonContentProps } from "./SlideButtonContent.types";

import * as styles from "./SlideButtonContent.css";

const DEFAULT_SLIDE_BUTTON_CONTENT_WIDTH = styles.SLIDE_BUTTON_WIDTH;

const travel = (ratio: number) => `calc(${ratio} * (100% - ${styles.SLIDE_BUTTON_THUMB_SIZE}px))`;

const covered = (ratio: number) =>
    `calc(${ratio} * (100% - ${styles.SLIDE_BUTTON_THUMB_SIZE}px) + ${styles.SLIDE_BUTTON_THUMB_SIZE / 2}px)`;

export const PageSlideButtonContent = (props: ParentProps<SlideButtonContentProps>) => {
    const getWidth = () => access(props.width) ?? DEFAULT_SLIDE_BUTTON_CONTENT_WIDTH;

    const getRatio = () => (access(props.flags).isPressed ? 1 : access(props.flags).progressRatio);

    const getIsTracking = () => access(props.flags).isDragging || access(props.flags).isHolding;

    return (
        <div
            class={styles.slideButtonContent}
            style={{ width: `${getWidth()}px` }}
            classList={{
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        >
            <div
                class={styles.slideButtonFill}
                classList={{ [styles.isTracking]: getIsTracking() }}
                style={{ width: covered(getRatio()) }}
            />

            <div class={styles.slideButtonHint} style={{ opacity: 1 - getRatio() }}>
                {props.children}
            </div>

            <div
                class={styles.slideButtonThumb}
                classList={{
                    [styles.isTracking]: getIsTracking(),
                    [styles.isFocused]: access(props.flags).isFocused,
                }}
                style={{ left: travel(getRatio()) }}
            >
                <svg class={styles.slideButtonArrow} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12 H19 M13 6 L19 12 L13 18" />
                </svg>
            </div>
        </div>
    );
};
