import type { PaginatorStep } from "../../../../Lib/Fundamentals/Paginator/Paginator.types";
import type {
    PaginatorGapContentProps,
    PaginatorPageContentProps,
    PaginatorStepContentProps,
} from "./PaginatorContent.types";

import * as styles from "./PaginatorContent.css";

const STEP_GLYPHS: Record<PaginatorStep, string> = {
    first: "«",
    previous: "‹",
    next: "›",
    last: "»",
};

export const PagePaginatorPage = (props: PaginatorPageContentProps) => (
    <div
        class={styles.paginatorPage}
        classList={{
            [styles.isCurrent]: props.getFlags().isCurrent,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {props.getFlags().page}
    </div>
);

export const PagePaginatorStep = (props: PaginatorStepContentProps) => (
    <div
        class={styles.paginatorStep}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {STEP_GLYPHS[props.getFlags().step]}
    </div>
);

export const PagePaginatorGap = (props: PaginatorGapContentProps) => (
    <div class={styles.paginatorGap} title={`Pages ${props.getEntry().from} to ${props.getEntry().to}`}>
        …
    </div>
);
