import { createMemo, createSignal } from "solid-js";

import type { AnchorHPlacement, AnchorVPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageCheckField, PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DefaultExample } from "./Examples/Default";
import type { SatelliteExampleProps } from "./SatellitePage.types";

const H_PLACEMENTS: AnchorHPlacement[] = ["left-out", "left-in", "center", "right-in", "right-out"];
const V_PLACEMENTS: AnchorVPlacement[] = ["top-out", "top-in", "center", "bottom-in", "bottom-out"];

const MIN_OFFSET = -40;
const MAX_OFFSET = 40;
const OFFSET_STEP = 2;
const MIN_SUBJECT_SIZE = 40;
const MAX_SUBJECT_SIZE = 240;
const SUBJECT_SIZE_STEP = 10;
const MIN_BADGE_SIZE = 12;
const MAX_BADGE_SIZE = 96;
const BADGE_SIZE_STEP = 4;
const FIELD_WIDTH = 110;
const HOST_WIDTH = 260;
const HOST_HEIGHT = 200;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/SatellitePage/Examples";

const STARTING_H_PLACEMENT: AnchorHPlacement = "right-out";
const STARTING_V_PLACEMENT: AnchorVPlacement = "top-out";
const STARTING_SUBJECT_WIDTH = 140;
const STARTING_SUBJECT_HEIGHT = 80;
const STARTING_BADGE_SIZE = 28;

const DefaultExampleWrapper = (props: SatelliteExampleProps) => {
    return (
        <PageMeasureBox getWidth={() => HOST_WIDTH} getHeight={() => HOST_HEIGHT}>
            <DefaultExample {...props} />
        </PageMeasureBox>
    );
};

export const SatellitePage = () => {
    const [getHPlacement, setHPlacement] = createSignal<AnchorHPlacement>(STARTING_H_PLACEMENT);
    const [getVPlacement, setVPlacement] = createSignal<AnchorVPlacement>(STARTING_V_PLACEMENT);
    const [getOffsetX, setOffsetX] = createSignal(0);
    const [getOffsetY, setOffsetY] = createSignal(0);
    const [getSubjectWidth, setSubjectWidth] = createSignal(STARTING_SUBJECT_WIDTH);
    const [getSubjectHeight, setSubjectHeight] = createSignal(STARTING_SUBJECT_HEIGHT);
    const [getBadgeSize, setBadgeSize] = createSignal(STARTING_BADGE_SIZE);
    const [getIsBehindSubject, setIsBehindSubject] = createSignal(false);

    const getPlacement = createMemo(() => ({ x: getHPlacement(), y: getVPlacement() }));

    const getOffset = createMemo(() => ({ x: getOffsetX(), y: getOffsetY() }));

    const getExamples = createMemo(() => {
        const commonProps: SatelliteExampleProps = {
            getPlacement,
            getOffset,
            getIsBehindSubject,
            getSubjectWidth,
            getSubjectHeight,
            getBadgeSize,
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Default.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Placement across"}>
                    <PageSelectField
                        getValue={getHPlacement}
                        getValues={() => H_PLACEMENTS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Placement across"}
                        onChange={(placement) => setHPlacement(() => placement)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Placement down"}>
                    <PageSelectField
                        getValue={getVPlacement}
                        getValues={() => V_PLACEMENTS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Placement down"}
                        onChange={(placement) => setVPlacement(() => placement)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Offset across (px)"}>
                    <PageNumberField
                        getValue={getOffsetX}
                        getMin={() => MIN_OFFSET}
                        getMax={() => MAX_OFFSET}
                        getStep={() => OFFSET_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Offset across"}
                        onInput={setOffsetX}
                    />
                </PageProp>

                <PageProp getLabel={() => "Offset down (px)"}>
                    <PageNumberField
                        getValue={getOffsetY}
                        getMin={() => MIN_OFFSET}
                        getMax={() => MAX_OFFSET}
                        getStep={() => OFFSET_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Offset down"}
                        onInput={setOffsetY}
                    />
                </PageProp>

                <PageProp getLabel={() => "Subject width (px)"}>
                    <PageNumberField
                        getValue={getSubjectWidth}
                        getMin={() => MIN_SUBJECT_SIZE}
                        getMax={() => MAX_SUBJECT_SIZE}
                        getStep={() => SUBJECT_SIZE_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Subject width"}
                        onInput={setSubjectWidth}
                    />
                </PageProp>

                <PageProp getLabel={() => "Subject height (px)"}>
                    <PageNumberField
                        getValue={getSubjectHeight}
                        getMin={() => MIN_SUBJECT_SIZE}
                        getMax={() => MAX_SUBJECT_SIZE}
                        getStep={() => SUBJECT_SIZE_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Subject height"}
                        onInput={setSubjectHeight}
                    />
                </PageProp>

                <PageProp getLabel={() => "Satellite size (px)"}>
                    <PageNumberField
                        getValue={getBadgeSize}
                        getMin={() => MIN_BADGE_SIZE}
                        getMax={() => MAX_BADGE_SIZE}
                        getStep={() => BADGE_SIZE_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Satellite size"}
                        onInput={setBadgeSize}
                    />
                </PageProp>

                <PageProp getLabel={() => "Behind the subject"}>
                    <PageCheckField
                        getValue={getIsBehindSubject}
                        getAriaLabel={() => "Behind the subject"}
                        onChange={setIsBehindSubject}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </>
    );
};
