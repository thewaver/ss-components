import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { RadioSegmentContentProps, RadioSegmentFloaterProps } from "./RadioSegmentContent.types";

import * as styles from "./RadioSegmentContent.css";

export const PageRadioSegmentGroup = (props: ParentProps) => <div class={styles.segmentGroup}>{props.children}</div>;

export const PageRadioSegmentContent = (props: ParentProps<RadioSegmentContentProps>) => {
    return (
        <div
            class={styles.segmentContent}
            classList={{
                [styles.isChecked]: access(props.flags).checkedState === true,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        >
            {props.children}
        </div>
    );
};

export const PageRadioSegmentFloater = (props: RadioSegmentFloaterProps) => {
    return (
        <div
            class={styles.segmentFloater}
            classList={{ [styles.isVisible]: access(props.visibilityTarget) === 1 }}
            style={{ "transition-duration": `${access(props.transitionDurationMs)}ms` }}
            data-floater
        />
    );
};
