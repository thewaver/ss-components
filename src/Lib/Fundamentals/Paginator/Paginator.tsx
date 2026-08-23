import type { Accessor, JSX } from "solid-js";
import { Index, Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type {
    PaginatorGapEntry,
    PaginatorItemProps,
    PaginatorPageEntry,
    PaginatorPageFlags,
    PaginatorProps,
    PaginatorStep,
    PaginatorStepFlags,
} from "./Paginator.types";
import { PaginatorUtils } from "./Paginator.utils";

import * as styles from "./Paginator.css";

const DEFAULT_PAGINATOR_STEPS: PaginatorStep[] = ["previous", "next"];
const DEFAULT_PAGINATOR_SIBLING_COUNT = 1;
const DEFAULT_PAGINATOR_BOUNDARY_COUNT = 1;
const DEFAULT_PAGINATOR_GAP = 0;
const DEFAULT_PAGINATOR_LABEL = "Pagination";

const LEADING_STEPS: PaginatorStep[] = ["first", "previous"];
const TRAILING_STEPS: PaginatorStep[] = ["next", "last"];

const STEP_LABELS: Record<PaginatorStep, string> = {
    first: "First page",
    previous: "Previous page",
    next: "Next page",
    last: "Last page",
};

const PaginatorItem = (props: PaginatorItemProps) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onActivate();
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.paginatorItem,
        get "id"() {
            return access(props.id);
        },
        get "aria-label"() {
            return access(props.ariaLabel);
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-current"() {
            return access(props.isCurrent) ? "page" : undefined;
        },
    };

    return (
        <Show
            when={access(props.href)}
            fallback={
                <button type="button" ref={(element) => props.ref?.(element)} {...commonProps} onClick={handleClick}>
                    {props.renderContent(() => access(props.flags))}
                </button>
            }
        >
            <Dynamic
                component={props.linkComponent ?? "a"}
                ref={(element: HTMLElement) => props.ref?.(element)}
                href={access(props.href)!}
                {...commonProps}
                onClick={handleClick}
            >
                {props.renderContent(() => access(props.flags))}
            </Dynamic>
        </Show>
    );
};

export const Paginator = (props: PaginatorProps) => {
    const getPageCount = createMemo(() => Math.max(Math.trunc(access(props.pageCount)), 0));

    const getIsDisabled = createMemo(() => access(props.isDisabled) ?? false);

    const getSteps = createMemo(() => access(props.steps) ?? DEFAULT_PAGINATOR_STEPS);

    const getEntries = createMemo(() =>
        PaginatorUtils.getEntries(access(props.page), {
            pageCount: getPageCount(),
            siblingCount: access(props.siblingCount) ?? DEFAULT_PAGINATOR_SIBLING_COUNT,
            boundaryCount: access(props.boundaryCount) ?? DEFAULT_PAGINATOR_BOUNDARY_COUNT,
        }),
    );

    const getLeadingSteps = createMemo(() => LEADING_STEPS.filter((step) => getSteps().includes(step)));

    const getTrailingSteps = createMemo(() => TRAILING_STEPS.filter((step) => getSteps().includes(step)));

    const goTo = (page: number) => {
        if (page === access(props.page)) return;

        void props.onPageChange?.(page);
    };

    const renderStepControl = (getStep: Accessor<PaginatorStep>) => {
        const getTargetPage = () => PaginatorUtils.getStepTarget(getStep(), access(props.page), getPageCount());

        const getIsStepDisabled = () => getIsDisabled() || getTargetPage() === access(props.page);

        return (
            <InteractionWrapper<PaginatorStepFlags>
                isDisabled={getIsStepDisabled}
                extraFlags={() => ({ step: getStep(), targetPage: getTargetPage() })}
                renderControl={(setElementRef, getFlags) => (
                    <PaginatorItem
                        ref={setElementRef}
                        href={() => (getIsStepDisabled() ? undefined : props.computeHref?.(getTargetPage()))}
                        isCurrent={false}
                        ariaLabel={() => props.computeStepLabel?.(getStep(), getTargetPage()) ?? STEP_LABELS[getStep()]}
                        flags={getFlags}
                        linkComponent={props.linkComponent}
                        renderContent={() => props.renderStep(getStep, getFlags)}
                        onActivate={() => goTo(getTargetPage())}
                    />
                )}
            />
        );
    };

    const renderPageControl = (getEntry: Accessor<PaginatorPageEntry>) => (
        <InteractionWrapper<PaginatorPageFlags>
            isDisabled={getIsDisabled}
            extraFlags={() => ({
                page: getEntry().page,
                isCurrent: getEntry().page === access(props.page),
            })}
            renderControl={(setElementRef, getFlags) => (
                <PaginatorItem
                    ref={setElementRef}
                    href={() => props.computeHref?.(getEntry().page)}
                    isCurrent={() => getFlags().isCurrent}
                    ariaLabel={() =>
                        props.computePageLabel?.(getEntry().page, getPageCount()) ?? `Page ${getEntry().page}`
                    }
                    flags={getFlags}
                    linkComponent={props.linkComponent}
                    renderContent={() => props.renderPage(getEntry, getFlags)}
                    onActivate={() => goTo(getEntry().page)}
                />
            )}
        />
    );

    const renderGapControl = (getEntry: Accessor<PaginatorGapEntry>) => (
        <span class={styles.paginatorGap} aria-hidden="true">
            {props.renderGap(getEntry)}
        </span>
    );

    return (
        <nav
            class={styles.paginatorRoot}
            style={{ gap: `${access(props.gap) ?? DEFAULT_PAGINATOR_GAP}px` }}
            aria-label={access(props.ariaLabel) ?? DEFAULT_PAGINATOR_LABEL}
        >
            <Index each={getLeadingSteps()}>{renderStepControl}</Index>

            <Index each={getEntries()}>
                {(getEntry) => (
                    <Show
                        when={getEntry().kind === "page" ? (getEntry() as PaginatorPageEntry) : undefined}
                        fallback={renderGapControl(() => getEntry() as PaginatorGapEntry)}
                    >
                        {renderPageControl}
                    </Show>
                )}
            </Index>

            <Index each={getTrailingSteps()}>{renderStepControl}</Index>
        </nav>
    );
};
