import { Show, createMemo, createSignal, createUniqueId } from "solid-js";
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

    const [getContentRef, setContentRef] = createSignal<HTMLElement>();

    const getIsExpanded = () => props.expandedSignal[0]();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_COLLAPSIBLE_TRANSITION_DURATION_MS,
    );

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_COLLAPSIBLE_SIZING);

    /**
     * CSS cannot transition to `auto`, so opening a panel means measuring the content and animating to a pixel
     * value. The measured box is the unconstrained inner div rather than the panel itself, because measuring
     * the box being animated would mean releasing and restoring its height on every pass — and it would fight
     * the transition it is feeding.
     */
    const getContentHeight = ElementObserver.createBorderBoxHeightObserver(getContentRef);

    const { getTransitionTarget } = ElementFader.createFader(getIsExpanded, { getTransitionDurationMs });

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
        <div class={[styles.collapsibleRoot, styles.collapsibleSizingVariants[getSizing()]].join(" ")}>
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
