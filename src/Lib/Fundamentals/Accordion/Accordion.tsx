import { Index, createMemo, createSignal, createUniqueId } from "solid-js";

import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { Collapsible } from "../Collapsible/Collapsible";
import type { AccordionProps, AccordionSectionProps, AccordionSizing } from "./Accordion.types";

import * as styles from "./Accordion.css";

const DEFAULT_ACCORDION_HEADING_LEVEL = 3;
const DEFAULT_ACCORDION_GAP = 0;
const DEFAULT_ACCORDION_SIZING: AccordionSizing = "fill";

const AccordionSection = <T,>(props: AccordionSectionProps<T>) => {
    const headerId = createUniqueId();

    const expandedSignal = SignalMirror.createValueMirror(props.getIsExpanded, () => props.onToggle());

    return (
        <Collapsible
            ref={props.ref}
            getId={() => headerId}
            getIsDisabled={() => props.getItem().isDisabled ?? false}
            getHeadingLevel={props.getHeadingLevel}
            getIsScrolledIntoViewOnExpand={props.getIsScrolledIntoViewOnExpand}
            getTransitionDurationMs={props.getTransitionDurationMs}
            getPanelRole={() => "region"}
            getPanelAriaAttributes={() => ({ "aria-labelledby": headerId })}
            expandedSignal={expandedSignal}
            renderTrigger={(getFlags) => props.renderHeader(props.getItem, getFlags)}
            renderPanel={(getVisibilityTarget, getTransitionDurationMs) =>
                props.renderPanel(props.getItem, getVisibilityTarget, getTransitionDurationMs)
            }
        />
    );
};

export const Accordion = <T,>(props: AccordionProps<T>) => {
    const [getHeaderRefs, setHeaderRefs] = createSignal<(HTMLElement | undefined)[]>([]);

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
                        getIsScrolledIntoViewOnExpand={props.getIsScrolledIntoViewOnExpand}
                        getTransitionDurationMs={props.getTransitionDurationMs}
                        renderHeader={props.renderHeader}
                        renderPanel={props.renderPanel}
                        onToggle={() => handleToggle(getItem().value)}
                    />
                )}
            </Index>
        </div>
    );
};
