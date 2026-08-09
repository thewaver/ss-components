import { createMemo, createSignal } from "solid-js";

import type { ImageSwitcherProps } from "../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher.types";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageNumberField, PageSelectField } from "../../PageComponents/Field/Field";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import knight_date from "../../knight_date.webp";
import knight_profile from "../../knight_profile.webp";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";

import { MEASURE_BOX_PADDING } from "../../PageComponents/MeasureBox/MeasureBox.css";
import * as styles from "./ImageSwitcherPage.css";

const IMAGE_CONTAINER_SIZE = 480 + MEASURE_BOX_PADDING * 2;
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

const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

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

    const getSrc = () => SOURCE_URLS[getSourceType()];

    const getExamples = createMemo(() => {
        const commonProps: ImageSwitcherProps = {
            getSrc,
            getTransitionDurationMs,
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                src: DEFAULT_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Source"}>
                    <PageSelectField
                        getValue={getSourceType}
                        getValues={() => SOURCE_TYPES}
                        getAriaLabel={() => "Source"}
                        onChange={(sourceType) => setSourceType(() => sourceType)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Transition duration (ms)"}>
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

            <PageExamples getItems={getExamples} />
        </div>
    );
};
