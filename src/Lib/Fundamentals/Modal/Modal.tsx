import { Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import type { ModalAlignment, ModalProps, ModalRole } from "./Modal.types";

import * as styles from "./Modal.css";

const DEFAULT_MODAL_TRANSITION_DURATION_MS = 200;
const DEFAULT_MODAL_ROLE: ModalRole = "dialog";
const DEFAULT_MODAL_ALIGNMENT: ModalAlignment = "center";

export const Modal = (props: ModalProps) => {
    const viewportContext = useViewportContext();

    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_MODAL_TRANSITION_DURATION_MS,
    );

    const getAlignment = createMemo(() => props.getAlignment?.() ?? DEFAULT_MODAL_ALIGNMENT);

    const getMargins = createMemo(() => {
        return props.getMargins?.() ?? CSSUtils.spreadMargin(0);
    });

    const { getIsVisible, getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(
        () => props.visibilitySignal[0](),
        { getTransitionDurationMs, onShow: props.onShow, onHide: props.onHide },
    );

    FocusUtils.autoFocus(getContainerRef, getIsVisible, { getInitialRef: props.getInitialFocusRef });

    const handleDismiss = () => {
        props.visibilitySignal[1](false);
    };

    const handleOverlayClick = () => {
        if (props.getIsDismissableOnOverlayClick?.() === false) return;

        handleDismiss();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            handleDismiss();
        }
    };

    createEffect(() => {
        onCleanup(() => {
            document.removeEventListener("keydown", handleKeyDown);
        });

        if (!getIsVisible()) return;

        document.addEventListener("keydown", handleKeyDown);
    });

    createEffect(() => {
        const hasTransitionFinished = getHasTransitionFinished();

        props.onTransitionStatusChange?.(hasTransitionFinished);
    });

    return (
        <Show when={getIsVisible()}>
            <Portal
                mount={viewportContext.getPortalRef()}
                ref={(el) => {
                    el.style.display = "contents";
                }}
            >
                <div
                    class={[styles.modalRoot, styles.modalAlignmentVariants[getAlignment()]].join(" ")}
                    onKeyDown={(e) => FocusUtils.focusTrapKeyDown(e, getContainerRef())}
                >
                    <div class={styles.modalOverlay} onClick={handleOverlayClick}>
                        {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                    <div
                        ref={setContainerRef}
                        class={styles.modalContainer}
                        style={{
                            ...CSSUtils.spreadableToStyle(getMargins(), (key) => StringUtils.camelToKebabCase(key)),
                            "max-width": `calc(100% - ${getMargins().marginLeft + getMargins().marginRight}px)`,
                            "max-height": `calc(100% - ${getMargins().marginTop + getMargins().marginBottom}px)`,
                        }}
                        role={props.getRole?.() ?? DEFAULT_MODAL_ROLE}
                        aria-modal="true"
                        aria-label={props.getAriaLabel?.()}
                        aria-labelledby={props.getAriaLabelledBy?.()}
                        aria-describedby={props.getAriaDescribedBy?.()}
                    >
                        {props.renderContent(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                </div>
            </Portal>
        </Show>
    );
};
