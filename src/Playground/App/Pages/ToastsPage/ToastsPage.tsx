import { createRoot, createSignal, createUniqueId } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Toasts } from "../../../../Lib/Fundamentals/Toasts/Toasts";
import type {
    Toast,
    ToastsAlignment,
    ToastsDir,
    ToastsOverflow,
} from "../../../../Lib/Fundamentals/Toasts/Toasts.types";
import { PageNumberField, PageSelectField } from "../../PageComponents/Field/Field";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageToastContent } from "../../StyledComponents/ToastContent/ToastContent";
import type { ToastAnimation, ToastDefs, ToastKind } from "../../StyledComponents/ToastContent/ToastContent.types";

import * as styles from "./ToastsPage.css";

const ALIGNMENTS: ToastsAlignment[] = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "middle-center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
];
const DIRS: ToastsDir[] = ["column", "column-reverse", "row", "row-reverse"];
const OVERFLOWS: ToastsOverflow[] = ["dismiss-oldest", "hold-newest"];
const ANIMATIONS: ToastAnimation[] = ["zoom", "slide", "fade"];
const LIMITS = [0, 1, 2, 3, 5];
const DURATIONS_MS = [0, 2000, 4000, 8000];
const NO_LIMIT = 0;
const STICKY = 0;

const STARTING_ALIGNMENT: ToastsAlignment = "bottom-right";
const STARTING_LIMIT = 3;
const STARTING_DURATION_MS = 4000;
const STARTING_GAP = 10;
const STARTING_MARGIN = 20;
const STARTING_TRANSITION_DURATION_MS = 300;

const MIN_GAP = 0;
const MAX_GAP = 40;
const MIN_MARGIN = 0;
const MAX_MARGIN = 80;
const MIN_TRANSITION_DURATION_MS = 0;
const MAX_TRANSITION_DURATION_MS = 2000;
const TRANSITION_DURATION_STEP_MS = 50;

const BURST_SIZE = 5;

const MESSAGES: Record<ToastKind, string> = {
    info: "Your export is being prepared.",
    success: "Settings saved.",
    error: "Upload failed — the file was larger than 25 MB.",
};

/**
 * Declared at module scope through `createRoot`, which is the whole of what an out-of-tree queue takes:
 * anything in the application can raise a notification, and nothing that raises one has to still be
 * mounted for it to show. In a real application the `Toasts` region sits at the app root rather than on
 * a page, so navigating away would not take the region with it.
 */
const toastQueue = createRoot(() => createSignal<Toast<ToastDefs>[]>([]));

const raiseToast = (kind: ToastKind, durationMs: number) => {
    toastQueue[1]((prev) => [
        ...prev,
        {
            id: createUniqueId(),
            value: { kind, message: MESSAGES[kind] },
            durationMs: durationMs === STICKY ? undefined : durationMs,
        },
    ]);
};

export const ToastsPage = () => {
    const [getAlignment, setAlignment] = createSignal<ToastsAlignment>(STARTING_ALIGNMENT);
    const [getDir, setDir] = createSignal<ToastsDir>("column");
    const [getOverflow, setOverflow] = createSignal<ToastsOverflow>("dismiss-oldest");
    const [getAnimation, setAnimation] = createSignal<ToastAnimation>("zoom");
    const [getLimit, setLimit] = createSignal(STARTING_LIMIT);
    const [getDurationMs, setDurationMs] = createSignal(STARTING_DURATION_MS);
    const [getGap, setGap] = createSignal(STARTING_GAP);
    const [getMargin, setMargin] = createSignal(STARTING_MARGIN);
    const [getTransitionDurationMs, setTransitionDurationMs] = createSignal(STARTING_TRANSITION_DURATION_MS);

    const [getToasts, setToasts] = toastQueue;

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Alignment"}>
                    <PageSelectField
                        getValue={getAlignment}
                        getValues={() => ALIGNMENTS}
                        getAriaLabel={() => "Alignment"}
                        onChange={(alignment) => setAlignment(() => alignment)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Dir"}>
                    <PageSelectField
                        getValue={getDir}
                        getValues={() => DIRS}
                        getAriaLabel={() => "Dir"}
                        onChange={(dir) => setDir(() => dir)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Limit"}>
                    <PageSelectField
                        getValue={getLimit}
                        getValues={() => LIMITS}
                        getAriaLabel={() => "Limit"}
                        computeLabel={(limit) => (limit === NO_LIMIT ? "none" : `${limit}`)}
                        onChange={setLimit}
                    />
                </PageProp>

                <PageProp getLabel={() => "Overflow"}>
                    <PageSelectField
                        getValue={getOverflow}
                        getValues={() => OVERFLOWS}
                        getAriaLabel={() => "Overflow"}
                        onChange={(overflow) => setOverflow(() => overflow)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Duration"}>
                    <PageSelectField
                        getValue={getDurationMs}
                        getValues={() => DURATIONS_MS}
                        getAriaLabel={() => "Duration"}
                        computeLabel={(durationMs) => (durationMs === STICKY ? "sticky" : `${durationMs}ms`)}
                        onChange={setDurationMs}
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation"}>
                    <PageSelectField
                        getValue={getAnimation}
                        getValues={() => ANIMATIONS}
                        getAriaLabel={() => "Animation"}
                        onChange={(animation) => setAnimation(() => animation)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Gap"}>
                    <PageNumberField
                        getValue={getGap}
                        getMin={() => MIN_GAP}
                        getMax={() => MAX_GAP}
                        getAriaLabel={() => "Gap"}
                        onInput={setGap}
                    />
                </PageProp>

                <PageProp getLabel={() => "Margin"}>
                    <PageNumberField
                        getValue={getMargin}
                        getMin={() => MIN_MARGIN}
                        getMax={() => MAX_MARGIN}
                        getAriaLabel={() => "Margin"}
                        onInput={setMargin}
                    />
                </PageProp>

                <PageProp getLabel={() => "Transition duration (ms)"}>
                    <PageNumberField
                        getValue={getTransitionDurationMs}
                        getMin={() => MIN_TRANSITION_DURATION_MS}
                        getMax={() => MAX_TRANSITION_DURATION_MS}
                        getStep={() => TRANSITION_DURATION_STEP_MS}
                        getAriaLabel={() => "Transition duration"}
                        onInput={setTransitionDurationMs}
                    />
                </PageProp>
            </PagePropsPanel>

            <div class={styles.raiseRow}>
                <Button
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Info</PageButtonContent>}
                    onClick={() => raiseToast("info", getDurationMs())}
                />
                <Button
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Success</PageButtonContent>}
                    onClick={() => raiseToast("success", getDurationMs())}
                />
                <Button
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Error</PageButtonContent>}
                    onClick={() => raiseToast("error", getDurationMs())}
                />
                <Button
                    renderContent={(getFlags) => (
                        <PageButtonContent getFlags={getFlags}>Raise {BURST_SIZE}</PageButtonContent>
                    )}
                    onClick={() => {
                        for (let index = 0; index < BURST_SIZE; index += 1) raiseToast("info", getDurationMs());
                    }}
                />
                <Button
                    renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Clear</PageButtonContent>}
                    onClick={() => {
                        setToasts([]);
                    }}
                />
            </div>

            <div class={styles.note} data-readout>
                queued: {getToasts().length} — the queue lives at module scope, so raising a notification does not need
                the raiser to still be mounted. Hover the stack to hold every countdown.
            </div>

            <Toasts
                toastsSignal={toastQueue}
                getAriaLabel={() => "Notifications"}
                getAlignment={getAlignment}
                getDir={getDir}
                getLimit={() => (getLimit() === NO_LIMIT ? undefined : getLimit())}
                getOverflow={getOverflow}
                getGap={getGap}
                getMargins={() => ({
                    marginTop: getMargin(),
                    marginRight: getMargin(),
                    marginBottom: getMargin(),
                    marginLeft: getMargin(),
                })}
                getTransitionDurationMs={getTransitionDurationMs}
                renderToast={(getToast, getVisibilityTarget, getToastTransitionDurationMs, getState) => (
                    <PageToastContent
                        getToast={getToast}
                        getState={getState}
                        getAnimation={getAnimation}
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getToastTransitionDurationMs}
                        onDismiss={() => setToasts((prev) => prev.filter((toast) => toast.id !== getToast().id))}
                    />
                )}
            />
        </div>
    );
};
