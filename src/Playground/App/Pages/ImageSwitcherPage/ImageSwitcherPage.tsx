import { createMemo, createSignal } from "solid-js";

import type { ImageSwitcherProps } from "../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import knight_date from "../../knight_date.webp";
import knight_profile from "../../knight_profile.webp";
import { DefaultExample } from "./Examples/Default";

import * as styles from "./ImageSwitcherPage.css";

const IMAGE_CONTAINER_SIZE = 480;
const MISSING_SRC = "missing_image.webp";
const SOURCE_TYPES = ["profile", "date", "missingFile", "none"] as const;

type SourceType = (typeof SOURCE_TYPES)[number];

const SOURCE_URLS: Record<SourceType, string | undefined> = {
    profile: knight_profile,
    date: knight_date,
    missingFile: MISSING_SRC,
    none: undefined,
};

const STARTING_DURATION_MS = 1000;
const MIN_DURATION_MS = 0;
const MAX_DURATION_MS = 5000;
const DURATION_STEP_MS = 50;

const DEFAULT_EXAMPLE_PATH = "/src/Playground/App/Pages/ImageSwitcherPage/Examples/Default.tsx";

const DefaultExampleWrapper = (props: ImageSwitcherProps) => {
    return (
        <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE} getHeight={() => IMAGE_CONTAINER_SIZE}>
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const ImageSwitcherPage = () => {
    const [getSourceType, setSourceType] = createSignal<SourceType>("profile");
    const [getTransitionDurationMs, setTransitionDurationMs] = createSignal(STARTING_DURATION_MS);
    const [getLoadCount, setLoadCount] = createSignal(0);
    const [getLoadedName, setLoadedName] = createSignal("none");

    const getSrc = () => SOURCE_URLS[getSourceType()];

    const onLoad = (e: Event) => {
        const loaded = (e.target as HTMLImageElement).src;

        setLoadCount((prev) => prev + 1);
        setLoadedName(loaded.slice(loaded.lastIndexOf("/") + 1));
    };

    const getExamples = createMemo(() => {
        const commonProps: ImageSwitcherProps = {
            getSrc,
            getTransitionDurationMs,
            onLoad,
        };

        return [
            {
                key: "default",
                name: "Default",
                readout: () => `loads: ${getLoadCount()} | last loaded: ${getLoadedName()}`,
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: DEFAULT_EXAMPLE_PATH,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "sourceType"} getLabel={() => "Source"}>
                    <PageSelectField
                        getValue={getSourceType}
                        getValues={() => SOURCE_TYPES}
                        getAriaLabel={() => "Source"}
                        onChange={(sourceType) => setSourceType(() => sourceType)}
                    />
                </PageProp>

                <PageProp getKey={() => "transitionDurationMs"} getLabel={() => "Transition duration (ms)"}>
                    <PageNumberField
                        getValue={getTransitionDurationMs}
                        getMin={() => MIN_DURATION_MS}
                        getMax={() => MAX_DURATION_MS}
                        getStep={() => DURATION_STEP_MS}
                        getAriaLabel={() => "Transition duration"}
                        onInput={setTransitionDurationMs}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} getLayout={() => "flow"} />
        </div>
    );
};
