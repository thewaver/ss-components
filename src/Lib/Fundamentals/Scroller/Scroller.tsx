import { Index, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { SignalMirror } from "../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../Utils/propUtils";
import type { ScrollerButtonPlacement, ScrollerProps, ScrollerStep, ScrollerStepper } from "./Scroller.types";

import * as styles from "./Scroller.css";

const DEFAULT_SCROLLER_GAP = 0;
const DEFAULT_SCROLLER_PADDING = 0;
const DEFAULT_SCROLLER_BUTTON_PLACEMENT: ScrollerButtonPlacement = "split";

const SCROLL_EPSILON = 1;
const RATIO_MIN = 0;

const readMetrics = (track: HTMLElement) => ({
    start: track.scrollLeft,
    visible: track.clientWidth,
    total: track.scrollWidth,
});

const computeScrollRange = (metrics: { visible: number; total: number }) =>
    Math.max(metrics.total - metrics.visible, 0);

const computeProgressRatio = (metrics: { start: number; visible: number; total: number }) => {
    const range = computeScrollRange(metrics);

    return range === 0 ? RATIO_MIN : Math.min(Math.max(metrics.start / range, RATIO_MIN), 1);
};

const computeOffsetWithin = (element: HTMLElement, ancestor: HTMLElement) => {
    let offset = 0;
    let node: HTMLElement | null = element;

    while (node && node !== ancestor) {
        offset += node.offsetLeft;
        node = node.offsetParent as HTMLElement | null;
    }

    return offset;
};

const computeRevealTarget = (track: HTMLElement, offset: number, length: number, padding: number) => {
    const { start, visible } = readMetrics(track);

    if (offset - padding < start) return offset - padding;

    return offset + length + padding > start + visible ? offset + length + padding - visible : start;
};

const computeStepTarget = (track: HTMLElement, step: ScrollerStep) => {
    const { start, visible } = readMetrics(track);
    const offsets = [...track.children].map((child) => (child as HTMLElement).offsetLeft);

    if (step === "next") {
        const limit = start + visible;

        return offsets.filter((offset) => offset > start + SCROLL_EPSILON && offset <= limit).pop() ?? limit;
    }

    const limit = start - visible;

    return offsets.filter((offset) => offset < start - SCROLL_EPSILON && offset >= limit).shift() ?? limit;
};

export const Scroller = (props: ScrollerProps) => {
    const [getTrackRef, setTrackRef] = createSignal<HTMLElement>();
    const [getMetrics, setMetrics] = createSignal({ start: 0, visible: 0, total: 0 });

    const getGap = createMemo(() => access(props.gap) ?? DEFAULT_SCROLLER_GAP);

    const getPadding = createMemo(() => access(props.padding) ?? DEFAULT_SCROLLER_PADDING);

    const getButtonPlacement = createMemo(() => access(props.buttonPlacement) ?? DEFAULT_SCROLLER_BUTTON_PLACEMENT);

    const stepper: ScrollerStepper = {
        getIsAtStart: () => getMetrics().start <= SCROLL_EPSILON,
        getIsAtEnd: () => getMetrics().start + getMetrics().visible >= getMetrics().total - SCROLL_EPSILON,
        stepToPrevious: () => {
            const track = getTrackRef();

            if (track) track.scrollTo({ left: computeStepTarget(track, "previous") });
        },
        stepToNext: () => {
            const track = getTrackRef();

            if (track) track.scrollTo({ left: computeStepTarget(track, "next") });
        },
    };

    const getIsScrollable = createMemo(() => getMetrics().total > getMetrics().visible + SCROLL_EPSILON);

    const [getProgressRatio, setProgressRatio] = SignalMirror.createOptional(() => props.progressSignal, RATIO_MIN);

    let reportedRatio = RATIO_MIN;

    createEffect(() => {
        reportedRatio = computeProgressRatio(getMetrics());

        setProgressRatio(reportedRatio);
    });

    createEffect(() => {
        const ratio = getProgressRatio();
        const track = getTrackRef();

        if (!track || ratio === reportedRatio) return;

        track.scrollTo({ left: ratio * computeScrollRange(readMetrics(track)) });
    });

    const getLeadingSteps = createMemo((): ScrollerStep[] => {
        const placement = getButtonPlacement();

        if (!getIsScrollable()) return [];
        if (placement === "start") return ["previous", "next"];

        return placement === "split" ? ["previous"] : [];
    });

    const getTrailingSteps = createMemo((): ScrollerStep[] => {
        const placement = getButtonPlacement();

        if (!getIsScrollable()) return [];
        if (placement === "end") return ["previous", "next"];

        return placement === "split" ? ["next"] : [];
    });

    createEffect(() => {
        const track = getTrackRef();

        if (!track) return;

        const update = () => setMetrics(readMetrics(track));
        const sizeObserver = new ResizeObserver(update);
        const childObserver = new MutationObserver(() => {
            for (const child of track.children) sizeObserver.observe(child);

            update();
        });

        sizeObserver.observe(track);

        for (const child of track.children) sizeObserver.observe(child);

        childObserver.observe(track, { childList: true });
        track.addEventListener("scroll", update, { passive: true });

        onCleanup(() => {
            sizeObserver.disconnect();
            childObserver.disconnect();
            track.removeEventListener("scroll", update);
        });

        update();
    });

    const handleFocusIn = (e: FocusEvent) => {
        const track = getTrackRef();
        const target = e.target as HTMLElement | null;

        if (!track || !target || target === track) return;

        const offset = computeOffsetWithin(target, track);

        track.scrollTo({ left: computeRevealTarget(track, offset, target.offsetWidth, getPadding()) });
    };

    return (
        <div class={styles.scrollerRoot} style={{ gap: `${getGap()}px` }}>
            <Index each={getLeadingSteps()}>{(getStep) => props.renderButton(getStep, stepper)}</Index>

            <div
                ref={setTrackRef}
                class={styles.scrollerTrack}
                style={{
                    "padding-block": `${getPadding()}px`,
                    "padding-inline-start": `${getPadding()}px`,
                }}
                onFocusIn={handleFocusIn}
            >
                {props.children}

                <div class={styles.scrollerTrackEnd} style={{ "flex-basis": `${getPadding()}px` }} />
            </div>

            <Index each={getTrailingSteps()}>{(getStep) => props.renderButton(getStep, stepper)}</Index>
        </div>
    );
};
