import { Index, createMemo, createSignal, createUniqueId } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type {
    AccordionFlags,
    AccordionHeaderProps,
    AccordionProps,
    AccordionSectionProps,
    AccordionSizing,
} from "./Accordion.types";

import * as styles from "./Accordion.css";

const DEFAULT_ACCORDION_TRANSITION_DURATION_MS = 200;
const DEFAULT_ACCORDION_HEADING_LEVEL = 3;
const DEFAULT_ACCORDION_GAP = 0;
const DEFAULT_ACCORDION_SIZING: AccordionSizing = "fill";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const AccordionHeader = <T,>(props: AccordionHeaderProps<T>) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.accordionHeader}
            aria-expanded={props.getIsExpanded()}
            aria-controls={props.getPanelId()}
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onToggle();
            }}
        >
            {props.renderHeader(props.getItem, props.getFlags)}
        </button>
    );
};

const AccordionSection = <T,>(props: AccordionSectionProps<T>) => {
    const headerId = createUniqueId();
    const panelId = createUniqueId();

    const [getContentRef, setContentRef] = createSignal<HTMLElement>();

    const getContentHeight = ElementObserver.createBorderBoxHeightObserver(getContentRef);

    const { getTransitionTarget } = ElementFader.createFader(props.getIsExpanded, {
        getTransitionDurationMs: props.getTransitionDurationMs,
    });

    const getHeadingTag = createMemo(
        () => HEADING_TAGS[Math.min(Math.max(props.getHeadingLevel(), 1), HEADING_TAGS.length) - 1],
    );

    return (
        <div class={styles.accordionSection}>
            <Dynamic component={getHeadingTag()} class={styles.accordionHeading}>
                <InteractionWrapper
                    getSizing={() => "fill"}
                    getIsDisabled={() => props.getItem().isDisabled ?? false}
                    getExtraFlags={(): AccordionFlags => ({ isExpanded: props.getIsExpanded() })}
                    ref={props.ref}
                    renderControl={(setElementRef, getFlags) => (
                        <AccordionHeader
                            ref={setElementRef}
                            getId={() => headerId}
                            getPanelId={() => panelId}
                            getFlags={getFlags}
                            getIsExpanded={props.getIsExpanded}
                            getItem={props.getItem}
                            renderHeader={props.renderHeader}
                            onToggle={props.onToggle}
                        />
                    )}
                />
            </Dynamic>

            <div
                id={panelId}
                class={styles.accordionPanel}
                style={{
                    "height": `${getTransitionTarget() === 1 ? getContentHeight() : 0}px`,
                    "transition-property": "height",
                    "transition-duration": `${props.getTransitionDurationMs()}ms`,
                }}
                role="region"
                aria-labelledby={headerId}
                inert={!props.getIsExpanded()}
            >
                <div ref={setContentRef}>
                    {props.renderPanel(props.getItem, getTransitionTarget, props.getTransitionDurationMs)}
                </div>
            </div>
        </div>
    );
};

export const Accordion = <T,>(props: AccordionProps<T>) => {
    const [getHeaderRefs, setHeaderRefs] = createSignal<(HTMLElement | undefined)[]>([]);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_ACCORDION_TRANSITION_DURATION_MS,
    );

    const getHeadingLevel = createMemo(() => props.getHeadingLevel?.() ?? DEFAULT_ACCORDION_HEADING_LEVEL);

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_ACCORDION_SIZING);

    const setHeaderRef = (index: number, element: HTMLElement) => {
        setHeaderRefs((prev) => {
            const next = [...prev];

            next[index] = element;

            return next;
        });
    };

    const getNavigableIndexes = createMemo(() =>
        props.getItems().reduce<number[]>((acc, item, index) => {
            if (!item.isDisabled) acc.push(index);

            return acc;
        }, []),
    );

    const handleToggle = (value: T) => {
        props.expandedSignal[1]((prev) => {
            const isExpanded = prev.includes(value);

            if (props.getIsSingleExpand?.()) return isExpanded ? [] : [value];

            return isExpanded ? prev.filter((expanded) => expanded !== value) : [...prev, value];
        });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const navigable = getNavigableIndexes();
        const focused = getHeaderRefs().findIndex((ref) => ref === document.activeElement);

        if (navigable.length < 1 || focused < 0) return;

        const position = NavigationUtils.computeNextPosition(e.key, navigable.indexOf(focused), navigable.length);

        if (position === undefined) return;

        e.preventDefault();

        getHeaderRefs()[navigable[position]]?.focus();
    };

    return (
        <div
            class={[styles.accordionRoot, styles.accordionSizingVariants[getSizing()]].join(" ")}
            style={{ gap: `${props.getGap?.() ?? DEFAULT_ACCORDION_GAP}px` }}
            onKeyDown={handleKeyDown}
        >
            <Index each={props.getItems()}>
                {(getItem, index) => (
                    <AccordionSection
                        ref={(element) => setHeaderRef(index, element)}
                        getItem={getItem}
                        getHeadingLevel={getHeadingLevel}
                        getIsExpanded={() => props.expandedSignal[0]().includes(getItem().value)}
                        getTransitionDurationMs={getTransitionDurationMs}
                        renderHeader={props.renderHeader}
                        renderPanel={props.renderPanel}
                        onToggle={() => handleToggle(getItem().value)}
                    />
                )}
            </Index>
        </div>
    );
};
