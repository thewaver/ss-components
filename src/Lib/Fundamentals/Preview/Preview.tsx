import { Show, createEffect, createMemo, createSignal, createUniqueId, on, onCleanup } from "solid-js";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { PreviewFlags, PreviewProps, PreviewSizing, PreviewTriggerProps } from "./Preview.types";

import * as styles from "./Preview.css";

const DEFAULT_PREVIEW_TRANSITION_DURATION_MS = 200;
const DEFAULT_PREVIEW_SIZING: PreviewSizing = "fill";

const PreviewTrigger = (props: PreviewTriggerProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <button
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            type="button"
            class={styles.previewTrigger}
            aria-expanded={props.getIsExpanded()}
            aria-controls={props.getContentId()}
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

export const Preview = (props: PreviewProps) => {
    const contentId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();
    const [getContentRef, setContentRef] = createSignal<HTMLElement>();
    const [getIsAwaitingScroll, setIsAwaitingScroll] = createSignal(false);

    const getIsExpanded = () => props.expandedSignal[0]();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_PREVIEW_TRANSITION_DURATION_MS,
    );

    const getSizing = createMemo(() => props.getSizing?.() ?? DEFAULT_PREVIEW_SIZING);

    const getContentHeight = ElementObserver.createBorderBoxHeightObserver(getContentRef);

    const getHasMeasured = createMemo(() => getContentHeight() > 0);

    const getIsOverflowing = createMemo(() => getHasMeasured() && getContentHeight() > props.getCollapsedHeight());

    const { getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(getIsExpanded, {
        getTransitionDurationMs,
    });

    createEffect(on(getIsExpanded, (isExpanded) => setIsAwaitingScroll(!isExpanded), { defer: true }));

    createEffect(() => {
        if (!getIsAwaitingScroll() || !getHasTransitionFinished()) return;

        setIsAwaitingScroll(false);

        const root = getRootRef();
        const trigger = getTriggerRef();

        if (props.getIsScrolledIntoViewOnCollapse?.() !== true || !root || !trigger) return;

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

    const getHeight = createMemo(() => {
        if (!getHasMeasured()) return props.getCollapsedHeight();

        return getTransitionTarget() === 1 || !getIsOverflowing() ? getContentHeight() : props.getCollapsedHeight();
    });

    const getOverlayTarget = createMemo((): 0 | 1 => (getTransitionTarget() === 1 ? 0 : 1));

    return (
        <div ref={setRootRef} class={[styles.previewRoot, styles.previewSizingVariants[getSizing()]].join(" ")}>
            <div
                id={contentId}
                class={styles.previewContent}
                style={{
                    "height": `${getHeight()}px`,
                    "transition-property": "height",
                    "transition-duration": `${getTransitionDurationMs()}ms`,
                }}
            >
                <div ref={setContentRef}>{props.renderContent()}</div>

                <Show when={props.renderOverlay && getIsOverflowing()}>
                    <div class={styles.previewOverlay}>
                        {props.renderOverlay?.(getOverlayTarget, getTransitionDurationMs)}
                    </div>
                </Show>
            </div>

            <Show when={getIsOverflowing()}>
                <InteractionWrapper
                    {...props}
                    getSizing={() => "fit-content"}
                    getExtraFlags={(): PreviewFlags => ({ isExpanded: getIsExpanded() })}
                    renderControl={(setElementRef, getFlags) => (
                        <PreviewTrigger
                            ref={(element) => {
                                setElementRef(element);
                                setTriggerRef(element);
                                props.ref?.(element);
                            }}
                            getId={props.getId}
                            getContentId={() => contentId}
                            getFlags={getFlags}
                            getIsExpanded={getIsExpanded}
                            renderTrigger={props.renderTrigger}
                            onToggle={() => props.expandedSignal[1]((prev) => !prev)}
                        />
                    )}
                />
            </Show>
        </div>
    );
};
