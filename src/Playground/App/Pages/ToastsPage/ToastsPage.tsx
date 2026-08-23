import { createRoot, createSignal, createUniqueId } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Toasts } from "../../../../Lib/Fundamentals/Toasts/Toasts";
import type {
    Toast,
    ToastsAlignment,
    ToastsDir,
    ToastsOverflow,
} from "../../../../Lib/Fundamentals/Toasts/Toasts.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
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
            <PagePropsPanel scope={"global"}>
                <PageProp key={"alignment"} label={"Alignment"}>
                    <PageSelectField
                        value={getAlignment}
                        values={() => ALIGNMENTS}
                        ariaLabel={"Alignment"}
                        onChange={(alignment) => setAlignment(() => alignment)}
                    />
                </PageProp>

                <PageProp key={"dir"} label={"Dir"}>
                    <PageSelectField
                        value={getDir}
                        values={() => DIRS}
                        ariaLabel={"Dir"}
                        onChange={(dir) => setDir(() => dir)}
                    />
                </PageProp>

                <PageProp key={"limit"} label={"Limit"}>
                    <PageSelectField
                        value={getLimit}
                        values={() => LIMITS}
                        ariaLabel={"Limit"}
                        computeLabel={(limit) => (limit === NO_LIMIT ? "none" : `${limit}`)}
                        onChange={setLimit}
                    />
                </PageProp>

                <PageProp key={"overflow"} label={"Overflow"}>
                    <PageSelectField
                        value={getOverflow}
                        values={() => OVERFLOWS}
                        ariaLabel={"Overflow"}
                        onChange={(overflow) => setOverflow(() => overflow)}
                    />
                </PageProp>

                <PageProp key={"durationMs"} label={"Duration"}>
                    <PageSelectField
                        value={getDurationMs}
                        values={() => DURATIONS_MS}
                        ariaLabel={"Duration"}
                        computeLabel={(durationMs) => (durationMs === STICKY ? "sticky" : `${durationMs}ms`)}
                        onChange={setDurationMs}
                    />
                </PageProp>

                <PageProp key={"animation"} label={"Animation"}>
                    <PageSelectField
                        value={getAnimation}
                        values={() => ANIMATIONS}
                        ariaLabel={"Animation"}
                        onChange={(animation) => setAnimation(() => animation)}
                    />
                </PageProp>

                <PageProp key={"gap"} label={"Gap"}>
                    <PageNumberField
                        value={getGap}
                        min={() => MIN_GAP}
                        max={() => MAX_GAP}
                        ariaLabel={"Gap"}
                        onInput={setGap}
                    />
                </PageProp>

                <PageProp key={"margin"} label={"Margin"}>
                    <PageNumberField
                        value={getMargin}
                        min={() => MIN_MARGIN}
                        max={() => MAX_MARGIN}
                        ariaLabel={"Margin"}
                        onInput={setMargin}
                    />
                </PageProp>

                <PageProp key={"transitionDurationMs"} label={"Transition duration (ms)"}>
                    <PageNumberField
                        value={getTransitionDurationMs}
                        min={() => MIN_TRANSITION_DURATION_MS}
                        max={() => MAX_TRANSITION_DURATION_MS}
                        step={() => TRANSITION_DURATION_STEP_MS}
                        ariaLabel={"Transition duration"}
                        onInput={setTransitionDurationMs}
                    />
                </PageProp>
            </PagePropsPanel>

            <div class={styles.raiseRow}>
                <Button
                    id={"raiseInfo"}
                    renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Info</PageButtonContent>}
                    onClick={() => raiseToast("info", getDurationMs())}
                />
                <Button
                    id={"raiseSuccess"}
                    renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Success</PageButtonContent>}
                    onClick={() => raiseToast("success", getDurationMs())}
                />
                <Button
                    id={"raiseError"}
                    renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Error</PageButtonContent>}
                    onClick={() => raiseToast("error", getDurationMs())}
                />
                <Button
                    id={"raiseBurst"}
                    renderContent={(getFlags) => (
                        <PageButtonContent flags={getFlags}>Raise {BURST_SIZE}</PageButtonContent>
                    )}
                    onClick={() => {
                        for (let index = 0; index < BURST_SIZE; index += 1) raiseToast("info", getDurationMs());
                    }}
                />
                <Button
                    id={"clearToasts"}
                    renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Clear</PageButtonContent>}
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
                ariaLabel={"Notifications"}
                alignment={getAlignment}
                dir={getDir}
                limit={() => (getLimit() === NO_LIMIT ? undefined : getLimit())}
                overflow={getOverflow}
                gap={getGap}
                margins={() => ({
                    marginTop: getMargin(),
                    marginRight: getMargin(),
                    marginBottom: getMargin(),
                    marginLeft: getMargin(),
                })}
                transitionDurationMs={getTransitionDurationMs}
                renderToast={(getToast, getVisibilityTarget, getToastTransitionDurationMs, getState) => (
                    <PageToastContent
                        toast={getToast}
                        state={getState}
                        animation={getAnimation}
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getToastTransitionDurationMs}
                        onDismiss={() => setToasts((prev) => prev.filter((toast) => toast.id !== getToast().id))}
                    />
                )}
            />
        </div>
    );
};
