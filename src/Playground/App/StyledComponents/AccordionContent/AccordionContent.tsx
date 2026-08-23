import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { AccordionHeaderProps, AccordionPanelProps } from "./AccordionContent.types";

import * as styles from "./AccordionContent.css";

export const PageAccordionHeader = (props: ParentProps<AccordionHeaderProps>) => {
    return (
        <div
            class={styles.accordionHeader}
            classList={{
                [styles.isExpanded]: access(props.flags).isExpanded,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            <div>{props.children}</div>

            <div class={styles.accordionMarker} aria-hidden>
                ▶
            </div>
        </div>
    );
};

export const PageAccordionPanel = (props: ParentProps<AccordionPanelProps>) => {
    return (
        <div
            class={styles.accordionPanel}
            style={{
                opacity: access(props.visibilityTarget),
                transition: `opacity ${access(props.transitionDurationMs)}ms`,
            }}
        >
            {props.children}
        </div>
    );
};
