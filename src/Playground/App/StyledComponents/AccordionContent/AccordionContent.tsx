import type { ParentProps } from "solid-js";

import type { AccordionHeaderProps, AccordionPanelProps } from "./AccordionContent.types";

import * as styles from "./AccordionContent.css";

export const PageAccordionHeader = (props: ParentProps<AccordionHeaderProps>) => (
    <div
        class={styles.accordionHeader}
        classList={{
            [styles.isExpanded]: props.getFlags().isExpanded,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        <div>{props.children}</div>

        <div class={styles.accordionMarker} aria-hidden>
            ▶
        </div>
    </div>
);

export const PageAccordionPanel = (props: ParentProps<AccordionPanelProps>) => (
    <div
        class={styles.accordionPanel}
        style={{
            opacity: props.getVisibilityTarget(),
            transition: `opacity ${props.getTransitionDurationMs()}ms`,
        }}
    >
        {props.children}
    </div>
);
