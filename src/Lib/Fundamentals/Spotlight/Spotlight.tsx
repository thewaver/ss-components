import { Index, Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { Rect } from "@thewaver/ss-utils";

import { Anchor } from "../../Abstracts/Anchor/Anchor";
import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { FocusUtils } from "../../Abstracts/Focus/Focus.utils";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import type { SpotlightProps } from "./Spotlight.types";
import { SpotlightUtils } from "./Spotlight.utils";

import * as styles from "./Spotlight.css";

const DEFAULT_SPOTLIGHT_TRANSITION_DURATION_MS = 200;
const DEFAULT_SPOTLIGHT_PADDING = 0;
const DEFAULT_SPOTLIGHT_POPUP_PLACEMENT: AnchorPlacement = { x: "center", y: "bottom-out" };
const DEFAULT_SPOTLIGHT_POPUP_OFFSET = { x: 0, y: 8 };

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "NumLock", "ScrollLock", "AltGraph"]);

/**
 * The base the three presets share. It is not exported: `SpotlightHint`, `SpotlightPrompt` and
 * `SpotlightGuide` differ in what they let the page do while they are open, and that is not something a
 * consumer should be able to change under a running spotlight — a mode that cannot move at runtime has no
 * business being a runtime prop.
 */
export const Spotlight = (props: SpotlightProps) => {
    const viewportContext = useViewportContext();

    const [getElementRect, setElementRect] = createSignal<Rect | undefined>(undefined, {
        equals: Rect.isSame,
    });
    const [getPortalRef, setPortalRef] = createSignal<HTMLElement>();
    const [getPopupRef, setPopupRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_SPOTLIGHT_TRANSITION_DURATION_MS,
    );

    const getPadding = createMemo(() => props.getPadding?.() ?? DEFAULT_SPOTLIGHT_PADDING);

    const { getIsVisible, getTransitionTarget } = ElementFader.createFader(() => props.visibilitySignal[0](), {
        getTransitionDurationMs,
        onShow: props.onShow,
        onHide: props.onHide,
    });

    const getHasPopup = createMemo(() => props.getMode() === "guide" && props.renderPopup !== undefined);

    ElementObserver.createViewportRectObserver(props.getElementRef, getIsVisible, { setElementRect, getPadding });

    const { getPlacement, getPosition, setContentRef } = Anchor.createPortalPosition(
        props.getElementRef,
        () => getIsVisible() && getHasPopup(),
        {
            getPlacement: () => props.getPopupPlacement?.() ?? DEFAULT_SPOTLIGHT_POPUP_PLACEMENT,
            getOffset: () => props.getPopupOffset?.() ?? DEFAULT_SPOTLIGHT_POPUP_OFFSET,
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

    /**
     * Escape stays live in every mode, including the one whose whole promise is that you cannot do anything
     * else. WCAG 2.1.2 is Level A and allows trapping focus only while the user has a standard way out, so
     * the honest description of `SpotlightPrompt` is "click it, or press Escape" — this is the "or".
     */
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!getIsVisible()) return;

        if (e.key === "Escape") {
            dismiss();

            return;
        }

        if (props.getMode() !== "hint") return;
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

    /**
     * `prompt` keeps the highlighted element as the only reachable thing, and it cannot use `inert` to do it:
     * `inert` is inherited and cannot be lifted off a descendant, so there is no "seal the page, except this
     * one control". Pulling focus back on `focusin` is what is left, and it catches `Tab`, `Shift+Tab` and a
     * programmatic focus alike.
     */
    createEffect(() => {
        const element = props.getElementRef();

        if (!getIsVisible() || props.getMode() !== "prompt" || !element) return;

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

    /**
     * `guide` seals the page instead, and one attribute does all three jobs — hit testing, tab order and the
     * accessibility tree. There is no single root to put it on: the content a `Viewport` wraps is not one node,
     * and `Portal` nests its own container inside the mount, so the page is two levels above what this
     * component holds. So the walk climbs from the portal to the body and seals everything off the path,
     * which is the same shape with a `Viewport` and without one. Elements already `inert` are left alone, or
     * the cleanup would hand back something that was never ours.
     */
    createEffect(() => {
        const portal = getPortalRef();

        if (!getIsVisible() || props.getMode() !== "guide" || !portal) return;

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

    /**
     * Focus waits for the placement rather than for the mount, and then latches. The popup is
     * `visibility: hidden` until `Anchor` has measured it, and a hidden element takes no focus, so
     * autofocusing on mount silently does nothing and leaves a sealed page with focus on the body. Latching is
     * the other half: the position changes on every step, and an autofocus that followed it would throw focus
     * back to the first control each time — so pressing `Next` would land the reader on `Skip all` with the
     * next press, which is the worst possible place to send them.
     */
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
                                onClick={() => props.getMode() === "hint" && dismiss()}
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
                        aria-label={props.getAriaLabel?.()}
                        onKeyDown={(e) => FocusUtils.focusTrapKeyDown(e, getPopupRef())}
                    >
                        {props.renderPopup?.(getTransitionTarget, getTransitionDurationMs, getPlacement)}
                    </div>
                </Show>
            </Portal>
        </Show>
    );
};
