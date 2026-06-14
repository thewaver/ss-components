import { Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { StringUtils } from "@thewaver/ss-utils";

import { CSSUtils } from "../../Abstracts/CSS/CSS.utils";
import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../Viewport/Viewpoer.context";
import type { ModalProps } from "./Modal.types";

import * as styles from "./Modal.css";

const DEFAULT_MODAL_TRANSITION_DURATION_MS = 200;

export const Modal = (props: ModalProps) => {
    const viewportContext = useViewportContext();

    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_MODAL_TRANSITION_DURATION_MS,
    );

    const getMargins = createMemo(() => {
        return props.getMargins?.() ?? CSSUtils.spreadMargin(0);
    });

    const { getIsVisible, getTransitionTarget, hide } = ElementFader.createFader(
        props.getIsVisible,
        getTransitionDurationMs,
        { onShow: props.onShow, onHide: props.onHide },
    );

    FocusUtils.autoFocus(getIsVisible, getContainerRef);

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
                <div class={styles.modalRoot} onKeyDown={(e) => FocusUtils.focusTrapKeyDown(e, getContainerRef())}>
                    <div class={styles.modalOverlay} onClick={hide}>
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
                        role="dialog"
                        aria-modal="true"
                    >
                        {props.renderContent(getTransitionTarget, getTransitionDurationMs)}
                    </div>
                </div>
            </Portal>
        </Show>
    );
};
