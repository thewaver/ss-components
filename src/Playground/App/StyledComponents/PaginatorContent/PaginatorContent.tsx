import type { PaginatorStep } from "../../../../Lib/Fundamentals/Paginator/Paginator.types";
import { access } from "../../../../Lib/Utils/propUtils";
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

export const PagePaginatorPage = (props: PaginatorPageContentProps) => {
    return (
        <div
            class={styles.paginatorPage}
            classList={{
                [styles.isCurrent]: access(props.flags).isCurrent,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {access(props.flags).page}
        </div>
    );
};

export const PagePaginatorStep = (props: PaginatorStepContentProps) => {
    return (
        <div
            class={styles.paginatorStep}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {STEP_GLYPHS[access(props.flags).step]}
        </div>
    );
};

export const PagePaginatorGap = (props: PaginatorGapContentProps) => {
    return (
        <div class={styles.paginatorGap} title={`Pages ${access(props.entry).from} to ${access(props.entry).to}`}>
            …
        </div>
    );
};
