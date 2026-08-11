import { Show, createEffect, createMemo, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import { Anchor } from "../../Abstracts/Anchor/Anchor";
import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { DismissStack } from "../../Abstracts/Dismiss/DismissStack";
import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import type { PopoverProps } from "./Popover.types";

import * as styles from "./Popover.css";

const DEFAULT_POPOVER_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_POPOVER_TRANSITION_DURATION_MS = 200;

export const Popover = (props: PopoverProps) => {
    const viewportContext = useViewportContext();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_POPOVER_TRANSITION_DURATION_MS,
    );

    const { getIsVisible, getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(props.getIsOpen, {
        getTransitionDurationMs,
    });

    const { getAnchorRect, getPlacement, getPosition, getZIndex, setContentRef } = Anchor.createPortalPosition(
        props.getAnchorRef,
        getIsVisible,
        {
            getPlacement: () => props.getPlacement?.() ?? DEFAULT_POPOVER_PLACEMENT,
            getOffset: props.getOffset,
            getReservedScreenSize: props.getReservedScreenSize,
        },
    );

    const getMinWidth = createMemo(() =>
        props.getHasAnchorMinWidth?.() ? `${getAnchorRect()?.width ?? 0}px` : undefined,
    );

    const getAnchorColor = createMemo(() => {
        const anchor = props.getAnchorRef();

        return anchor && getIsVisible() ? getComputedStyle(anchor).color : undefined;
    });

    const getHasFocus = createMemo(
        () => (props.getHasAutoFocus?.() ?? false) && props.getIsOpen() && getPosition() !== undefined,
    );

    FocusUtils.autoFocus(getRootRef, getHasFocus, { getInitialRef: getRootRef });

    DismissStack.createLayer(props.getIsOpen, {
        getRoots: () => [getRootRef(), props.getAnchorRef()],
        onDismiss: (reason) => props.onDismiss?.(reason),
    });

    createEffect(() => {
        props.onTransitionStatusChange?.(getHasTransitionFinished());
    });

    return (
        <Show when={getIsVisible()}>
            <Portal mount={viewportContext.getPortalRef()}>
                <div
                    ref={(element) => {
                        setContentRef(element);
                        setRootRef(element);
                    }}
                    id={props.getId()}
                    class={styles.popoverRoot}
                    style={{
                        "visibility": getPosition() ? "visible" : "hidden",
                        "transform": `translate(${getPosition()?.x ?? 0}px, ${getPosition()?.y ?? 0}px)`,
                        "min-width": getMinWidth(),
                        "color": getAnchorColor(),
                        "z-index": getZIndex(),
                    }}
                    tabIndex={-1}
                    inert={!props.getIsOpen()}
                    role={props.getRole()}
                    {...props.getAriaAttributes?.()}
                    onKeyDown={(e) => props.onKeyDown?.(e)}
                    onBlur={(e) => props.onBlur?.(e)}
                    onMouseDown={(e) => {
                        if (props.getRole() === "dialog") return;

                        e.preventDefault();
                    }}
                >
                    {props.renderContent(getTransitionTarget, getTransitionDurationMs, getPlacement)}
                </div>
            </Portal>
        </Show>
    );
};
