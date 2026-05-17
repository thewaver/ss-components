import { Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../Viewport/Viewpoer.context";
import type { ModalProps } from "./Modal.types";

import * as styles from "./Modal.css";

const DEFAULT_MODAL_TRANSITION_DURATION_MS = 200;

export const Modal = (props: ModalProps) => {
    const viewportContext = useViewportContext();

    let containerRef: HTMLElement | undefined;

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_MODAL_TRANSITION_DURATION_MS,
    );

    const { getIsVisible, getTransitionTarget, hide } = ElementFader.createFader(
        props.getIsVisible,
        getTransitionDurationMs,
        { onShow: props.onShow, onHide: props.onHide },
    );

    FocusUtils.autoFocus(getIsVisible, containerRef);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            hide();
        }
    };

    createEffect(() => {
        onCleanup(() => {
            document.removeEventListener("keydown", handleKeyDown);
        });

        if (!getIsVisible()) return;

        document.addEventListener("keydown", handleKeyDown);
    });

    return (
        <Show when={getIsVisible()}>
            <Portal
                mount={viewportContext.getPortalRef()}
                ref={(el) => {
                    el.style.display = "contents";
                }}
            >
                <div class={styles.modalRoot} onKeyDown={(e) => FocusUtils.focusTrapKeyDown(e, containerRef)}>
                    <div class={styles.modalOverlay} onClick={hide}>
                        {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                    <div
                        ref={(el) => {
                            containerRef = el;
                        }}
                        class={styles.modalContainer}
                    >
                        {props.renderContent(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                </div>
            </Portal>
        </Show>
    );
};
