import { Index, createMemo, createSignal, createUniqueId } from "solid-js";

import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../Utils/propUtils";
import { Collapsible } from "../Collapsible/Collapsible";
import type { AccordionProps, AccordionSectionProps, AccordionSizing } from "./Accordion.types";

import * as styles from "./Accordion.css";

const DEFAULT_ACCORDION_HEADING_LEVEL = 3;
const DEFAULT_ACCORDION_GAP = 0;
const DEFAULT_ACCORDION_SIZING: AccordionSizing = "fill";

const AccordionSection = <T,>(props: AccordionSectionProps<T>) => {
    const headerId = createUniqueId();

    const expandedSignal = SignalMirror.createPassThrough(
        () => access(props.isExpanded),
        () => props.onToggle(),
    );

    return (
        <Collapsible
            ref={props.ref}
            id={() => headerId}
            isDisabled={() => access(props.item).isDisabled ?? false}
            headingLevel={props.headingLevel}
            isScrolledIntoViewOnExpand={props.isScrolledIntoViewOnExpand}
            transitionDurationMs={props.transitionDurationMs}
            panelRole={"region"}
            panelAriaAttributes={() => ({ "aria-labelledby": headerId })}
            expandedSignal={expandedSignal}
            renderTrigger={(getFlags) => props.renderHeader(() => access(props.item), getFlags)}
            renderPanel={(getVisibilityTarget, getTransitionDurationMs) =>
                props.renderPanel(() => access(props.item), getVisibilityTarget, getTransitionDurationMs)
            }
        />
    );
};

export const Accordion = <T,>(props: AccordionProps<T>) => {
    const [getHeaderRefs, setHeaderRefs] = createSignal<(HTMLElement | undefined)[]>([]);

    const getHeadingLevel = createMemo(() => access(props.headingLevel) ?? DEFAULT_ACCORDION_HEADING_LEVEL);

    const getSizing = createMemo(() => access(props.sizing) ?? DEFAULT_ACCORDION_SIZING);

    const setHeaderRef = (index: number, element: HTMLElement) => {
        setHeaderRefs((prev) => {
            const next = [...prev];

            next[index] = element;

            return next;
        });
    };

    const getNavigableIndexes = createMemo(() =>
        access(props.items).reduce<number[]>((acc, item, index) => {
            if (!item.isDisabled) acc.push(index);

            return acc;
        }, []),
    );

    const handleToggle = (value: T) => {
        props.expandedSignal[1]((prev) => {
            const isExpanded = prev.includes(value);
            const isLastExpanded = isExpanded && prev.length === 1;

            if (isLastExpanded && (access(props.isExpandRequired) ?? false)) return prev;

            if (access(props.isSingleExpand)) return isExpanded ? [] : [value];

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
            style={{ gap: `${access(props.gap) ?? DEFAULT_ACCORDION_GAP}px` }}
            onKeyDown={handleKeyDown}
        >
            <Index each={access(props.items)}>
                {(getItem, index) => (
                    <AccordionSection
                        ref={(element) => setHeaderRef(index, element)}
                        item={getItem}
                        headingLevel={getHeadingLevel}
                        isExpanded={() => props.expandedSignal[0]().includes(getItem().value)}
                        isScrolledIntoViewOnExpand={props.isScrolledIntoViewOnExpand}
                        transitionDurationMs={props.transitionDurationMs}
                        renderHeader={props.renderHeader}
                        renderPanel={props.renderPanel}
                        onToggle={() => handleToggle(getItem().value)}
                    />
                )}
            </Index>
        </div>
    );
};
