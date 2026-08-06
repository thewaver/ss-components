import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Progress } from "../../../../Lib/Fundamentals/Progress/Progress";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageProgressContent } from "../../StyledComponents/ProgressContent/ProgressContent";

const UPLOAD_TOTAL_BYTES = 2_400_000;
const UPLOAD_TICK_MS = 50;
const UPLOAD_TICK_BYTES = 24_000;

export const ProgressPage = () => {
    const [getUploadedBytes, setUploadedBytes] = createSignal(0);

    onMount(() => {
        const timer = setInterval(() => {
            setUploadedBytes((prev) => (prev >= UPLOAD_TOTAL_BYTES ? 0 : prev + UPLOAD_TICK_BYTES));
        }, UPLOAD_TICK_MS);

        onCleanup(() => {
            clearInterval(timer);
        });
    });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Determinate",
                readout: () => "ratio: 0.4 — a plain 0..1 value, which is what the painter is handed",
                component: () => (
                    <Progress
                        getValue={() => 0.4}
                        getAriaLabel={() => "Setup progress"}
                        getSizing={() => "fit-content"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
            {
                name: "Indeterminate",
                readout: () => "no value at all, so aria-valuenow is absent and the painter animates instead",
                component: () => (
                    <Progress
                        getAriaLabel={() => "Reticulating splines"}
                        getSizing={() => "fit-content"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
            {
                name: "Live range",
                readout: () => `${getUploadedBytes()} of ${UPLOAD_TOTAL_BYTES} bytes — min and max are the real units`,
                component: () => (
                    <Progress
                        getValue={getUploadedBytes}
                        getMax={() => UPLOAD_TOTAL_BYTES}
                        getAriaLabel={() => "Upload"}
                        getAriaValueText={() => `${Math.round(getUploadedBytes() / 1000)} of 2400 kB`}
                        getSizing={() => "fit-content"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
            {
                name: "Out of range",
                readout: () => "value: 5 against a 0..1 range — clamped rather than drawn past the end",
                component: () => (
                    <Progress
                        getValue={() => 5}
                        getAriaLabel={() => "Clamped progress"}
                        getSizing={() => "fit-content"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => "value: 0.62 — the transfer stalled, and hasError is the owner's to say",
                component: () => (
                    <Progress
                        getValue={() => 0.62}
                        getHasError={() => true}
                        getAriaLabel={() => "Failed upload"}
                        getSizing={() => "fit-content"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
            {
                name: "Filling its container",
                readout: () => "sizing: fill — the default, since a track's natural width is its container's",
                component: () => (
                    <Progress
                        getValue={() => 0.75}
                        getAriaLabel={() => "Full width progress"}
                        renderContent={(getState) => <PageProgressContent getState={getState} />}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
