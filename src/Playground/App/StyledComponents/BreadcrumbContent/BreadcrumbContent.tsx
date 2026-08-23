import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { BreadcrumbContentProps } from "./BreadcrumbContent.types";

import * as styles from "./BreadcrumbContent.css";

export const PageBreadcrumbContent = (props: ParentProps<BreadcrumbContentProps>) => {
    return (
        <div
            class={styles.breadcrumbContent}
            classList={{
                [styles.isCurrent]: access(props.flags).isCurrent,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            {props.children}
        </div>
    );
};

export const PageBreadcrumbSeparator = () => <span class={styles.breadcrumbSeparator}>/</span>;
