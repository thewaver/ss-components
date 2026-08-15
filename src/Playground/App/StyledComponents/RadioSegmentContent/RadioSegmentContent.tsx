import type { ParentProps } from "solid-js";

import type { RadioSegmentContentProps, RadioSegmentFloaterProps } from "./RadioSegmentContent.types";

import * as styles from "./RadioSegmentContent.css";

export const PageRadioSegmentGroup = (props: ParentProps) => <div class={styles.segmentGroup}>{props.children}</div>;

export const PageRadioSegmentContent = (props: ParentProps<RadioSegmentContentProps>) => (
    <div
        class={styles.segmentContent}
        classList={{
            [styles.isChecked]: props.getFlags().checkedState === true,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        {props.children}
    </div>
);

export const PageRadioSegmentFloater = (props: RadioSegmentFloaterProps) => (
    <div
        class={styles.segmentFloater}
        classList={{ [styles.isVisible]: props.getVisibilityTarget() === 1 }}
        style={{ "transition-duration": `${props.getTransitionDurationMs()}ms` }}
        data-floater
    />
);
