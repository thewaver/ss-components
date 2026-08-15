import type { ParentProps } from "solid-js";

import type { BreadcrumbContentProps } from "./BreadcrumbContent.types";

import * as styles from "./BreadcrumbContent.css";

export const PageBreadcrumbContent = (props: ParentProps<BreadcrumbContentProps>) => (
    <div
        class={styles.breadcrumbContent}
        classList={{
            [styles.isCurrent]: props.getFlags().isCurrent,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}
    </div>
);

export const PageBreadcrumbSeparator = () => <span class={styles.breadcrumbSeparator}>/</span>;
