import { Show, createEffect, createMemo, createSignal, createUniqueId, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { Anchor } from "../../Abstracts/Anchor/Anchor";
import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import { access } from "../../Utils/propUtils";
import type { TooltipProps } from "./Tooltip.types";

import * as styles from "./Tooltip.css";

const DEFAULT_TOOLTIP_TRANSITION_DURATION_MS = 200;
const DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS = 500;
const DEFAULT_ARIA_DESCRIBED_BY = "aria-describedby";

export const Tooltip = (props: TooltipProps) => {
    const viewportContext = useViewportContext();

    const tooltipId = createUniqueId();

    let focusTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(focusTimeout);
    });

    const [getShouldShow, setShouldShow] = createSignal(false);

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_TOOLTIP_TRANSITION_DURATION_MS,
    );

    const getFocusShowDelayMs = createMemo(
        () => access(props.focusShowDelayMs) ?? DEFAULT_TOOLTIP_SHOW_ON_FOCUS_DELAY_MS,
    );

    const { getIsVisible, getTransitionTarget } = ElementFader.createFader(getShouldShow, {
        getTransitionDurationMs,
    });

    const { getPlacement, getPosition, getZIndex, setContentRef } = Anchor.createPortalPosition(
        () => access(props.anchorRef),
        getIsVisible,
        {
            getPlacement: () => access(props.placement),
            getOffset: props.offset === undefined ? undefined : () => access(props.offset)!,
            getReservedScreenSize:
                props.reservedScreenSize === undefined ? undefined : () => access(props.reservedScreenSize)!,
        },
    );

    const handleMouseEnter = () => {
        clearTimeout(focusTimeout);
        setShouldShow(true);
    };

    const handleMouseLeave = () => {
        clearTimeout(focusTimeout);
        setShouldShow(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            clearTimeout(focusTimeout);
            setShouldShow(false);
        }
    };

    const handleFocus = () => {
        clearTimeout(focusTimeout);

        const anchorRef = access(props.anchorRef);

        if (FocusUtils.getIsRestoringFocus()) return;
        if (anchorRef && !anchorRef.matches(":focus-visible")) return;

        focusTimeout = setTimeout(() => {
            setShouldShow(true);
        }, getFocusShowDelayMs());
    };

    const handleBlur = () => {
        clearTimeout(focusTimeout);
        setShouldShow(false);
    };

    createEffect(() => {
        const anchorRef = access(props.anchorRef);

        onCleanup(() => {
            anchorRef?.removeEventListener("mouseenter", handleMouseEnter);
            anchorRef?.removeEventListener("mouseleave", handleMouseLeave);
            anchorRef?.removeEventListener("keydown", handleKeyDown);
            anchorRef?.removeEventListener("focus", handleFocus);
            anchorRef?.removeEventListener("blur", handleBlur);
        });

        if (!anchorRef) return;

        anchorRef.addEventListener("mouseenter", handleMouseEnter);
        anchorRef.addEventListener("mouseleave", handleMouseLeave);
        anchorRef.addEventListener("keydown", handleKeyDown);
        anchorRef.addEventListener("focus", handleFocus);
        anchorRef.addEventListener("blur", handleBlur);
    });

    createEffect(() => {
        const anchorRef = access(props.anchorRef);
        const isVisible = getIsVisible();

        if (!anchorRef || !isVisible) return;

        const describedBy = anchorRef.getAttribute(DEFAULT_ARIA_DESCRIBED_BY);
        const ids = describedBy ? describedBy.split(/\s+/).filter(Boolean) : [];

        if (!ids.includes(tooltipId)) {
            anchorRef.setAttribute(DEFAULT_ARIA_DESCRIBED_BY, [...ids, tooltipId].join(" "));
        }

        onCleanup(() => {
            const current = anchorRef.getAttribute(DEFAULT_ARIA_DESCRIBED_BY);

            if (!current) return;

            const remaining = current.split(/\s+/).filter((id) => id && id !== tooltipId);

            if (remaining.length) {
                anchorRef.setAttribute(DEFAULT_ARIA_DESCRIBED_BY, remaining.join(" "));
            } else {
                anchorRef.removeAttribute(DEFAULT_ARIA_DESCRIBED_BY);
            }
        });
    });

    return (
        <Show when={getIsVisible()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div
                    ref={setContentRef}
                    id={tooltipId}
                    class={styles.tooltipRoot}
                    style={{
                        "visibility": getPosition() ? "visible" : "hidden",
                        "transform": `translate(${getPosition()?.x ?? 0}px, ${getPosition()?.y ?? 0}px)`,
                        "z-index": getZIndex(),
                    }}
                    role="tooltip"
                >
                    {props.renderContent(getTransitionTarget, getTransitionDurationMs, getPlacement)}
                </div>
            </Portal>
        </Show>
    );
};
