import type { Accessor, JSX } from "solid-js";
import { Index, Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

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
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

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
            return props.getId?.();
        },
        get "aria-label"() {
            return props.getAriaLabel?.();
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-current"() {
            return props.getIsCurrent() ? "page" : undefined;
        },
    };

    return (
        <Show
            when={props.getHref()}
            fallback={
                <button type="button" ref={(element) => props.ref?.(element)} {...commonProps} onClick={handleClick}>
                    {props.renderContent(props.getFlags)}
                </button>
            }
        >
            <Dynamic
                component={props.linkComponent ?? "a"}
                ref={(element: HTMLElement) => props.ref?.(element)}
                href={props.getHref()!}
                {...commonProps}
                onClick={handleClick}
            >
                {props.renderContent(props.getFlags)}
            </Dynamic>
        </Show>
    );
};

export const Paginator = (props: PaginatorProps) => {
    const getPageCount = createMemo(() => Math.max(Math.trunc(props.getPageCount()), 0));

    const getIsDisabled = createMemo(() => props.getIsDisabled?.() ?? false);

    const getSteps = createMemo(() => props.getSteps?.() ?? DEFAULT_PAGINATOR_STEPS);

    const getEntries = createMemo(() =>
        PaginatorUtils.getEntries(props.getPage(), {
            pageCount: getPageCount(),
            siblingCount: props.getSiblingCount?.() ?? DEFAULT_PAGINATOR_SIBLING_COUNT,
            boundaryCount: props.getBoundaryCount?.() ?? DEFAULT_PAGINATOR_BOUNDARY_COUNT,
        }),
    );

    const getLeadingSteps = createMemo(() => LEADING_STEPS.filter((step) => getSteps().includes(step)));

    const getTrailingSteps = createMemo(() => TRAILING_STEPS.filter((step) => getSteps().includes(step)));

    const goTo = (page: number) => {
        if (page === props.getPage()) return;

        void props.onPageChange?.(page);
    };

    const renderStepControl = (getStep: Accessor<PaginatorStep>) => {
        const getTargetPage = () => PaginatorUtils.getStepTarget(getStep(), props.getPage(), getPageCount());

        const getIsStepDisabled = () => getIsDisabled() || getTargetPage() === props.getPage();

        return (
            <InteractionWrapper<PaginatorStepFlags>
                getIsDisabled={getIsStepDisabled}
                getExtraFlags={() => ({ step: getStep(), targetPage: getTargetPage() })}
                renderControl={(setElementRef, getFlags) => (
                    <PaginatorItem
                        ref={setElementRef}
                        getHref={() => (getIsStepDisabled() ? undefined : props.computeHref?.(getTargetPage()))}
                        getIsCurrent={() => false}
                        getAriaLabel={() =>
                            props.computeStepLabel?.(getStep(), getTargetPage()) ?? STEP_LABELS[getStep()]
                        }
                        getFlags={getFlags}
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
            getIsDisabled={getIsDisabled}
            getExtraFlags={() => ({
                page: getEntry().page,
                isCurrent: getEntry().page === props.getPage(),
            })}
            renderControl={(setElementRef, getFlags) => (
                <PaginatorItem
                    ref={setElementRef}
                    getHref={() => props.computeHref?.(getEntry().page)}
                    getIsCurrent={() => getFlags().isCurrent}
                    getAriaLabel={() =>
                        props.computePageLabel?.(getEntry().page, getPageCount()) ?? `Page ${getEntry().page}`
                    }
                    getFlags={getFlags}
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
            style={{ gap: `${props.getGap?.() ?? DEFAULT_PAGINATOR_GAP}px` }}
            aria-label={props.getAriaLabel?.() ?? DEFAULT_PAGINATOR_LABEL}
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
