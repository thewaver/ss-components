import { For, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { CSSUtils, StringUtils } from "@thewaver/ss-utils";

import { ElementFader } from "../../Abstracts/ElementFader/ElementFader";
import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { useViewportContext } from "../../Exotics/Viewport/Viewport.context";
import { access } from "../../Utils/propUtils";
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

const ToastsItem = <T,>(props: ToastsItemProps<T>) => {
    const { getTransitionTarget, getHasTransitionFinished } = ElementFader.createFader(() => !access(props.isExiting), {
        getTransitionDurationMs: () => access(props.transitionDurationMs),
    });

    const getDurationMs = createMemo(() => access(props.toast).durationMs);

    const getState = createMemo((): ToastState => ({
        index: access(props.index),
        count: access(props.count),
        isPaused: access(props.isPaused),
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

        if (access(props.isPaused)) return;

        const startedAtMs = performance.now();
        const elapseTimeout = setTimeout(() => props.onElapse(), remainingMs);

        onCleanup(() => {
            clearTimeout(elapseTimeout);

            remainingMs = Math.max(remainingMs - (performance.now() - startedAtMs), 0);
        });
    });

    createEffect(() => {
        if (!access(props.isExiting) || !getHasTransitionFinished()) return;

        props.onExitEnd();
    });

    return (
        <div class={styles.toastsItem}>
            {props.renderToast(
                () => access(props.toast),
                getTransitionTarget,
                () => access(props.transitionDurationMs),
                getState,
            )}
        </div>
    );
};

export const Toasts = <T,>(props: ToastsProps<T>) => {
    const viewportContext = useViewportContext();

    const [getEntryIds, setEntryIds] = createSignal<string[]>([]);
    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_TOASTS_TRANSITION_DURATION_MS,
    );

    const getAlignment = createMemo(() => access(props.alignment) ?? DEFAULT_TOASTS_ALIGNMENT);

    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_TOASTS_DIR);

    const getOverflow = createMemo(() => access(props.overflow) ?? DEFAULT_TOASTS_OVERFLOW);

    const getMargins = createMemo(() => access(props.margins) ?? CSSUtils.spreadMargin(0));

    const getStackAlignment = createMemo(() => ToastsUtils.computeStackAlignment(getAlignment(), getDir()));

    const getIsPaused = InteractionUtils.trackHold(getRootRef);

    const getAdmitted = createMemo(() => {
        const toasts = props.toastsSignal[0]();
        const limit = access(props.limit);

        if (limit === undefined || toasts.length <= limit) return toasts;

        return getOverflow() === "hold-newest" ? toasts.slice(0, limit) : toasts.slice(toasts.length - limit);
    });

    const dismiss = (id: string) => {
        props.toastsSignal[1]((prev) => {
            const next = prev.filter((toast) => toast.id !== id);

            return next.length === prev.length ? prev : next;
        });
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
        const limit = access(props.limit);
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
                ref={setRootRef}
                class={styles.toastsRegion}
                style={{
                    ...CSSUtils.spreadableToStyle(getMargins(), (key) => StringUtils.camelToKebabCase(key)),
                    "flex-direction": getDir(),
                    "justify-content": getStackAlignment().justifyContent,
                    "align-items": getStackAlignment().alignItems,
                    "gap": `${access(props.gap) ?? DEFAULT_TOASTS_GAP}px`,
                    "z-index": TOASTS_Z_INDEX,
                }}
                role="region"
                aria-live={access(props.ariaLive) ?? DEFAULT_TOASTS_ARIA_LIVE}
                aria-label={access(props.ariaLabel)}
            >
                <For each={getEntryIds()}>
                    {(id, getIndex) => {
                        const findToast = () => getAdmitted().find((toast) => toast.id === id);
                        const getToast = createMemo((prev: Toast<T>) => findToast() ?? prev, findToast()!);

                        return (
                            <ToastsItem
                                toast={getToast}
                                index={getIndex}
                                count={() => getEntryIds().length}
                                isExiting={() => findToast() === undefined}
                                isPaused={getIsPaused}
                                transitionDurationMs={getTransitionDurationMs}
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
