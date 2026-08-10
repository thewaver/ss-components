import { For, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { useViewportContext } from "../Viewport/Viewport.context";
import type {
    Toast,
    ToastState,
    ToastsAlignment,
    ToastsAriaLive,
    ToastsDir,
    ToastsItemProps,
    ToastsOverflow,
    ToastsProps,
} from "./Toasts.types";
import { ToastsUtils } from "./Toasts.utils";

import * as styles from "./Toasts.css";

const DEFAULT_TOASTS_TRANSITION_DURATION_MS = 200;
const DEFAULT_TOASTS_ALIGNMENT: ToastsAlignment = "bottom-right";
const DEFAULT_TOASTS_DIR: ToastsDir = "column";
const DEFAULT_TOASTS_ARIA_LIVE: ToastsAriaLive = "polite";
const DEFAULT_TOASTS_OVERFLOW: ToastsOverflow = "dismiss-oldest";
const DEFAULT_TOASTS_GAP = 10;
const TOASTS_Z_INDEX = 200;

const getHasLeft = (event: FocusEvent | MouseEvent) => {
    const target = event.relatedTarget;

    return !(target instanceof Node) || !(event.currentTarget as HTMLElement).contains(target);
};

const ToastsItem = <T,>(props: ToastsItemProps<T>) => {
    const { getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(() => !props.getIsExiting(), {
        getTransitionDurationMs: props.getTransitionDurationMs,
    });

    const getDurationMs = createMemo(() => props.getToast().durationMs);

    const getState = createMemo((): ToastState => ({
        index: props.getIndex(),
        count: props.getCount(),
        isPaused: props.getIsPaused(),
    }));

    let clockDurationMs: number | undefined;
    let remainingMs = 0;

    createEffect(() => {
        const durationMs = getDurationMs();

        if (durationMs === undefined) return;

        if (durationMs !== clockDurationMs) {
            clockDurationMs = durationMs;
            remainingMs = durationMs;
        }

        if (props.getIsPaused()) return;

        const startedAtMs = performance.now();
        const elapseTimeout = setTimeout(() => props.onElapse(), remainingMs);

        onCleanup(() => {
            clearTimeout(elapseTimeout);

            remainingMs = Math.max(remainingMs - (performance.now() - startedAtMs), 0);
        });
    });

    createEffect(() => {
        if (!props.getIsExiting() || !getHasTransitionFinished()) return;

        props.onExitEnd();
    });

    return (
        <div class={styles.toastsItem}>
            {props.renderToast(props.getToast, getTransitionTarget, props.getTransitionDurationMs, getState)}
        </div>
    );
};

export const Toasts = <T,>(props: ToastsProps<T>) => {
    const viewportContext = useViewportContext();

    const [getEntryIds, setEntryIds] = createSignal<string[]>([]);
    const [getIsHovered, setIsHovered] = createSignal(false);
    const [getHasFocusWithin, setHasFocusWithin] = createSignal(false);

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TOASTS_TRANSITION_DURATION_MS,
    );

    const getAlignment = createMemo(() => props.getAlignment?.() ?? DEFAULT_TOASTS_ALIGNMENT);

    const getDir = createMemo(() => props.getDir?.() ?? DEFAULT_TOASTS_DIR);

    const getOverflow = createMemo(() => props.getOverflow?.() ?? DEFAULT_TOASTS_OVERFLOW);

    const getMargins = createMemo(() => props.getMargins?.() ?? CSSUtils.spreadMargin(0));

    const getStackAlignment = createMemo(() => ToastsUtils.computeStackAlignment(getAlignment(), getDir()));

    const getIsPaused = createMemo(() => getIsHovered() || getHasFocusWithin());

    const getAdmitted = createMemo(() => {
        const toasts = props.toastsSignal[0]();
        const limit = props.getLimit?.();

        if (limit === undefined || toasts.length <= limit) return toasts;

        return getOverflow() === "hold-newest" ? toasts.slice(0, limit) : toasts.slice(toasts.length - limit);
    });

    const dismiss = (id: string) => {
        props.toastsSignal[1]((prev) => prev.filter((toast) => toast.id !== id));
    };

    const handleExitEnd = (id: string) => {
        if (getAdmitted().some((toast) => toast.id === id)) return;

        setEntryIds((prev) => prev.filter((entryId) => entryId !== id));
    };

    createEffect(() => {
        const admitted = getAdmitted();

        setEntryIds((prev) => {
            const added = admitted.filter((toast) => !prev.includes(toast.id)).map((toast) => toast.id);

            return added.length > 0 ? [...prev, ...added] : prev;
        });
    });

    createEffect(() => {
        const [getToasts, setToasts] = props.toastsSignal;
        const limit = props.getLimit?.();
        const toasts = getToasts();

        if (limit === undefined || getOverflow() !== "dismiss-oldest" || toasts.length <= limit) return;

        setToasts((prev) => prev.slice(prev.length - limit));
    });

    return (
        <Portal
            mount={viewportContext.getPortalRef()}
            ref={(el) => {
                el.style.display = "contents";
            }}
        >
            <div
                class={styles.toastsRegion}
                style={{
                    ...CSSUtils.spreadableToStyle(getMargins(), (key) => StringUtils.camelToKebabCase(key)),
                    "flex-direction": getDir(),
                    "justify-content": getStackAlignment().justifyContent,
                    "align-items": getStackAlignment().alignItems,
                    "gap": `${props.getGap?.() ?? DEFAULT_TOASTS_GAP}px`,
                    "z-index": TOASTS_Z_INDEX,
                }}
                role="region"
                aria-live={props.getAriaLive?.() ?? DEFAULT_TOASTS_ARIA_LIVE}
                aria-label={props.getAriaLabel()}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={(e) => {
                    if (!getHasLeft(e)) return;

                    setIsHovered(false);
                }}
                onFocusIn={() => setHasFocusWithin(true)}
                onFocusOut={(e) => {
                    if (!getHasLeft(e)) return;

                    setHasFocusWithin(false);
                }}
            >
                <For each={getEntryIds()}>
                    {(id, getIndex) => {
                        const findToast = () => getAdmitted().find((toast) => toast.id === id);
                        const getToast = createMemo((prev: Toast<T>) => findToast() ?? prev, findToast()!);

                        return (
                            <ToastsItem
                                getToast={getToast}
                                getIndex={getIndex}
                                getCount={() => getEntryIds().length}
                                getIsExiting={() => findToast() === undefined}
                                getIsPaused={getIsPaused}
                                getTransitionDurationMs={getTransitionDurationMs}
                                renderToast={props.renderToast}
                                onElapse={() => dismiss(id)}
                                onExitEnd={() => handleExitEnd(id)}
                            />
                        );
                    }}
                </For>
            </div>
        </Portal>
    );
};
