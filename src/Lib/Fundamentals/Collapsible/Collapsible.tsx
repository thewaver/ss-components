import { Show, createEffect, createMemo, createSignal, createUniqueId, on, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";

import { MathUtils } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type {
    CollapsibleFlags,
    CollapsibleProps,
    CollapsibleSizing,
    CollapsibleTriggerProps,
} from "./Collapsible.types";

import * as styles from "./Collapsible.css";

const DEFAULT_COLLAPSIBLE_TRANSITION_DURATION_MS = 200;
const DEFAULT_COLLAPSIBLE_SIZING: CollapsibleSizing = "fill";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const CollapsibleTrigger = (props: CollapsibleTriggerProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.collapsibleTrigger}
            aria-expanded={props.getIsExpanded()}
            aria-controls={props.getPanelId()}
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onToggle();
            }}
        >
            {props.renderTrigger(props.getFlags)}
        </button>
    );
};

export const Collapsible = (props: CollapsibleProps) => {
    const triggerId = createUniqueId();
    const panelId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();
    const [getContentRef, setContentRef] = createSignal<HTMLElement>();
    const [getIsAwaitingScroll, setIsAwaitingScroll] = createSignal(false);

    const getIsExpanded = () => props.expandedSignal[0]();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_COLLAPSIBLE_TRANSITION_DURATION_MS,
    );

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_COLLAPSIBLE_SIZING);

    const getContentHeight = ElementObserver.createBorderBoxHeightObserver(getContentRef);

    const { getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(getIsExpanded, {
        getTransitionDurationMs,
    });

    createEffect(on(getIsExpanded, (isExpanded) => setIsAwaitingScroll(isExpanded), { defer: true }));

    createEffect(() => {
        if (!getIsAwaitingScroll() || !getHasTransitionFinished()) return;

        setIsAwaitingScroll(false);

        const root = getRootRef();
        const trigger = getTriggerRef();

        if (props.getIsScrolledIntoViewOnExpand?.() !== true || !root || !trigger) return;

        const scrollIntoView = () => {
            root.scrollIntoView({ block: "nearest" });
            trigger.scrollIntoView({ block: "nearest" });
        };

        scrollIntoView();

        const frameId = requestAnimationFrame(scrollIntoView);

        onCleanup(() => {
            cancelAnimationFrame(frameId);
        });
    });

    const getHeadingTag = createMemo(() => {
        const level = props.getHeadingLevel?.();

        return level === undefined ? undefined : HEADING_TAGS[MathUtils.clamp(level, 1, HEADING_TAGS.length) - 1];
    });

    const renderWrapper = () => (
        <InteractionWrapper
            {...props}
            getSizing={() => "fill"}
            getExtraFlags={(): CollapsibleFlags => ({ isExpanded: getIsExpanded() })}
            renderControl={(setElementRef, getFlags) => (
                <CollapsibleTrigger
                    ref={(element) => {
                        setElementRef(element);
                        setTriggerRef(element);
                        props.ref?.(element);
                    }}
                    getId={() => props.getId?.() ?? triggerId}
                    getPanelId={() => panelId}
                    getFlags={getFlags}
                    getIsExpanded={getIsExpanded}
                    renderTrigger={props.renderTrigger}
                    onToggle={() => props.expandedSignal[1]((prev) => !prev)}
                />
            )}
        />
    );

    return (
        <div ref={setRootRef} class={[styles.collapsibleRoot, styles.collapsibleSizingVariants[getSizing()]].join(" ")}>
            <Show when={getHeadingTag()} fallback={renderWrapper()}>
                {(getTag) => (
                    <Dynamic component={getTag()} class={styles.collapsibleHeading}>
                        {renderWrapper()}
                    </Dynamic>
                )}
            </Show>

            <div
                id={panelId}
                class={styles.collapsiblePanel}
                style={{
                    "height": `${getTransitionTarget() === 1 ? getContentHeight() : 0}px`,
                    "transition-property": "height",
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
                role={props.getPanelRole?.()}
                {...(props.getPanelAriaAttributes?.() ?? {})}
                inert={!getIsExpanded()}
            >
                <div ref={setContentRef}>{props.renderPanel(getTransitionTarget, getTransitionDurationMs)}</div>
            </div>
        </div>
    );
};
