import { Index, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect } from "@thewaver/ss-utils";

import { Anchor } from "../../Abstracts/Anchor/Anchor";
import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { LiveAnnouncer } from "../../Abstracts/LiveAnnouncer/LiveAnnouncer";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import { access } from "../../Utils/propUtils";
import type { SpotlightProps } from "./Spotlight.types";
import { SpotlightUtils } from "./Spotlight.utils";

import * as styles from "./Spotlight.css";

const DEFAULT_SPOTLIGHT_TRANSITION_DURATION_MS = 200;
const DEFAULT_SPOTLIGHT_PADDING = 0;
const DEFAULT_SPOTLIGHT_POPUP_PLACEMENT: AnchorPlacement = { x: "center", y: "bottom-out" };
const DEFAULT_SPOTLIGHT_POPUP_OFFSET = { x: 0, y: 8 };

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock", "ScrollLock", "AltGraph"]);

export const Spotlight = (props: SpotlightProps) => {
    const viewportContext = useViewportContext();

    const [getElementRect, setElementRect] = createSignal<Rect | undefined>(undefined, {
        equals: Rect.isSame,
    });
    const [getPortalRef, setPortalRef] = createSignal<HTMLElement>();
    const [getPopupRef, setPopupRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_SPOTLIGHT_TRANSITION_DURATION_MS,
    );

    const getPadding = createMemo(() => access(props.padding) ?? DEFAULT_SPOTLIGHT_PADDING);

    const { getIsVisible, getTransitionTarget } = ElementFader.createFader(() => props.visibilitySignal[0](), {
        getTransitionDurationMs,
        onShow: props.onShow,
        onHide: props.onHide,
    });

    const getHasPopup = createMemo(() => access(props.mode) === "guide" && props.renderPopup !== undefined);

    ElementObserver.createViewportRectObserver(() => access(props.elementRef), getIsVisible, {
        setElementRect,
        getPadding,
    });

    createEffect(() => {
        const element = access(props.elementRef);

        if (!getIsVisible() || !element) return;

        element.scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    const { getPlacement, getPosition, setContentRef } = Anchor.createPortalPosition(
        () => access(props.elementRef),
        () => getIsVisible() && getHasPopup(),
        {
            getPlacement: () => access(props.popupPlacement) ?? DEFAULT_SPOTLIGHT_POPUP_PLACEMENT,
            getOffset: () => access(props.popupOffset) ?? DEFAULT_SPOTLIGHT_POPUP_OFFSET,
            getAnchorRect: getElementRect,
        },
    );

    const getSegmentRects = createMemo(() => {
        const rect = getElementRect();

        if (!rect) return;

        return SpotlightUtils.getSegmentRects(rect);
    });

    const dismiss = () => {
        props.visibilitySignal[1](false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            dismiss();

            return;
        }

        if (access(props.mode) !== "hint") return;
        if (MODIFIER_KEYS.has(e.key)) return;

        dismiss();
    };

    createEffect(() => {
        onCleanup(() => {
            document.removeEventListener("keydown", handleKeyDown);
        });

        if (!getIsVisible()) return;

        document.addEventListener("keydown", handleKeyDown);
    });

    createEffect(() => {
        const element = access(props.elementRef);

        if (!getIsVisible() || access(props.mode) !== "prompt" || !element) return;

        const onFocusIn = (e: FocusEvent) => {
            const target = e.target as Node | null;

            if (target && (element === target || element.contains(target))) return;

            element.focus({ preventScroll: true });
        };

        element.focus({ preventScroll: true });
        document.addEventListener("focusin", onFocusIn);

        onCleanup(() => {
            document.removeEventListener("focusin", onFocusIn);
        });
    });

    createEffect(() => {
        const portal = getPortalRef();

        if (!getIsVisible() || access(props.mode) !== "guide" || !portal) return;

        const sealed: HTMLElement[] = [];

        let node: HTMLElement | null = portal;

        while (node && node !== document.body) {
            const parent: HTMLElement | null = node.parentElement;

            if (!parent) break;

            for (const child of parent.children) {
                if (child === node || !(child instanceof HTMLElement) || child.inert) continue;

                child.inert = true;
                sealed.push(child);
            }

            node = parent;
        }

        onCleanup(() => {
            for (const sibling of sealed) sibling.inert = false;
        });
    });

    onMount(() => {
        if (props.announcement === undefined) return;

        LiveAnnouncer.reserve("polite");
    });

    createEffect<string | undefined>((previous) => {
        const announcement = access(props.announcement);

        if (!getIsVisible()) return previous;
        if (previous !== undefined && announcement !== undefined && announcement !== previous) {
            LiveAnnouncer.announce(announcement);
        }

        return announcement;
    });

    const [getHasPlaced, setHasPlaced] = createSignal(false);

    createEffect(() => {
        if (!getIsVisible() || !getHasPopup()) {
            setHasPlaced(false);

            return;
        }

        if (getPosition()) setHasPlaced(true);
    });

    FocusUtils.autoFocus(getPopupRef, getHasPlaced);

    return (
        <Show when={getIsVisible() && getSegmentRects()}>
            <Portal ref={setPortalRef} mount={viewportContext.getPortalRef()}>
                <div class={styles.spotlightOverlay}>
                    <Index each={Object.values(getSegmentRects()!)}>
                        {(getRect) => (
                            <div
                                class={styles.spotlightOverlaySegment}
                                style={getRect()}
                                onClick={() => access(props.mode) === "hint" && dismiss()}
                            >
                                {props.renderOverlay(getTransitionTarget, getTransitionDurationMs)}
                            </div>
                        )}
                    </Index>
                </div>

                <Show when={props.renderHighlight && getElementRect()}>
                    {(getRect) => (
                        <div
                            class={styles.spotlightDecoration}
                            style={{
                                top: `${getRect().y}px`,
                                left: `${getRect().x}px`,
                                width: `${getRect().width}px`,
                                height: `${getRect().height}px`,
                            }}
                        >
                            {props.renderHighlight?.(getTransitionTarget, getTransitionDurationMs)}
                        </div>
                    )}
                </Show>

                <Show when={getHasPopup()}>
                    <div
                        ref={(element) => {
                            setPopupRef(element);
                            setContentRef(element);
                        }}
                        class={styles.spotlightPopup}
                        style={{
                            visibility: getPosition() ? "visible" : "hidden",
                            transform: `translate(${getPosition()?.x ?? 0}px, ${getPosition()?.y ?? 0}px)`,
                        }}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-label={access(props.ariaLabel)}
                        onKeyDown={(e) => FocusUtils.focusTrapKeyDown(e, getPopupRef())}
                    >
                        {props.renderPopup?.(getTransitionTarget, getTransitionDurationMs, getPlacement)}
                    </div>
                </Show>
            </Portal>
        </Show>
    );
};
