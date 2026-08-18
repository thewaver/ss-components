import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageCheckField, PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import { DrumOverExample } from "./Examples/DrumOver";
import { DrumSidewaysExample } from "./Examples/DrumSideways";
import { FlatExample } from "./Examples/Flat";
import type { WheelExampleProps, WheelSpinStyleFn } from "./WheelPage.types";

const MIN_WEDGE_COUNT = 2;
const MAX_WEDGE_COUNT = 12;
const WEDGE_COUNT_STEP = 1;
const MIN_DURATION_MS = 500;
const MAX_DURATION_MS = 6000;
const DURATION_STEP_MS = 500;
const MIN_IDLE_DELAY_MS = 1000;
const MAX_IDLE_DELAY_MS = 8000;
const IDLE_DELAY_STEP_MS = 500;
const FIELD_WIDTH = 130;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/WheelPage/Examples";

const STARTING_WEDGE_COUNT = 8;
const STARTING_SPIN_DURATION_MS = 3000;
const STARTING_SETTLE_DURATION_MS = 1500;
const STARTING_IDLE_DELAY_MS = 3000;

const FLAT_WHEEL_SIZE = 340;
const PLAIN_TURNS = 3;
const MIN_LIVELY_TURNS = 1;
const MAX_LIVELY_TURNS = 3;
const LIVELY_JITTER_SPREAD = 0.9;

const PRIZES = [
    "Free spin",
    "Ten coins",
    "Nothing",
    "A hat",
    "Fifty coins",
    "A shrug",
    "Two hats",
    "Jackpot",
    "A sticker",
    "Half a coin",
    "A rumour",
    "Another go",
];

const rigid: WheelSpinStyleFn = () => ({ turns: PLAIN_TURNS, jitterRatio: 0 });

const bouncy: WheelSpinStyleFn = () => ({
    turns: MIN_LIVELY_TURNS + Math.floor(Math.random() * (MAX_LIVELY_TURNS - MIN_LIVELY_TURNS + 1)),
    jitterRatio: (Math.random() - 0.5) * LIVELY_JITTER_SPREAD,
});

const SPIN_STYLES = { rigid, bouncy } satisfies Record<string, WheelSpinStyleFn>;

type SpinStyleKey = keyof typeof SPIN_STYLES;

const SPIN_STYLE_KEYS = Object.keys(SPIN_STYLES) as SpinStyleKey[];

const STARTING_SPIN_STYLE_KEY: SpinStyleKey = "bouncy";

const FlatExampleWrapper = (props: WheelExampleProps) => {
    return (
        <PageMeasureBox getWidth={() => FLAT_WHEEL_SIZE}>
            <FlatExample {...props} />
        </PageMeasureBox>
    );
};

const DrumSidewaysExampleWrapper = (props: WheelExampleProps) => {
    return (
        <PageMeasureBox>
            <DrumSidewaysExample {...props} />
        </PageMeasureBox>
    );
};

const DrumOverExampleWrapper = (props: WheelExampleProps) => {
    return (
        <PageMeasureBox>
            <DrumOverExample {...props} />
        </PageMeasureBox>
    );
};

export const WheelPage = () => {
    const [getWedgeCount, setWedgeCount] = createSignal(STARTING_WEDGE_COUNT);
    const [getSpinDurationMs, setSpinDurationMs] = createSignal(STARTING_SPIN_DURATION_MS);
    const [getSettleDurationMs, setSettleDurationMs] = createSignal(STARTING_SETTLE_DURATION_MS);
    const [getIdleDelayMs, setIdleDelayMs] = createSignal(STARTING_IDLE_DELAY_MS);
    const [getSpinStyleKey, setSpinStyleKey] = createSignal<SpinStyleKey>(STARTING_SPIN_STYLE_KEY);
    const [getIsDisabled, setIsDisabled] = createSignal(false);
    const [getIsIdlingAllowed, setIsIdlingAllowed] = createSignal(true);

    const flatIndexSignal = createSignal(0);
    const sidewaysIndexSignal = createSignal(0);
    const reelIndexSignal = createSignal(0);

    const getWedges = createMemo(() => PRIZES.slice(0, getWedgeCount()));

    const getIdleDelay = () => (getIsIdlingAllowed() ? getIdleDelayMs() : undefined);

    const getExamples = createMemo(() => {
        const commonProps = {
            getWedges,
            getIsDisabled,
            getSpinDurationMs,
            getSettleDurationMs,
            getIdleDelayMs: getIdleDelay,
            computeSpinDefs: (index: number, wedgeCount: number) => SPIN_STYLES[getSpinStyleKey()](index, wedgeCount),
        };

        return [
            {
                name: "Flat, topside",
                component: () => <FlatExampleWrapper {...commonProps} indexSignal={flatIndexSignal} />,
                path: `${EXAMPLES_ROOT}/Flat.tsx`,
            },
            {
                name: "Drum, turning sideways",
                component: () => <DrumSidewaysExampleWrapper {...commonProps} indexSignal={sidewaysIndexSignal} />,
                path: `${EXAMPLES_ROOT}/DrumSideways.tsx`,
            },
            {
                name: "Drum, turning over",
                component: () => <DrumOverExampleWrapper {...commonProps} indexSignal={reelIndexSignal} />,
                path: `${EXAMPLES_ROOT}/DrumOver.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Wedges"}>
                    <PageNumberField
                        getValue={getWedgeCount}
                        getMin={() => MIN_WEDGE_COUNT}
                        getMax={() => MAX_WEDGE_COUNT}
                        getStep={() => WEDGE_COUNT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Wedges"}
                        onInput={setWedgeCount}
                    />
                </PageProp>

                <PageProp getLabel={() => "Spin duration (ms)"}>
                    <PageNumberField
                        getValue={getSpinDurationMs}
                        getMin={() => MIN_DURATION_MS}
                        getMax={() => MAX_DURATION_MS}
                        getStep={() => DURATION_STEP_MS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Spin duration"}
                        onInput={setSpinDurationMs}
                    />
                </PageProp>

                <PageProp getLabel={() => "Settle duration (ms)"}>
                    <PageNumberField
                        getValue={getSettleDurationMs}
                        getMin={() => MIN_DURATION_MS}
                        getMax={() => MAX_DURATION_MS}
                        getStep={() => DURATION_STEP_MS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Settle duration"}
                        onInput={setSettleDurationMs}
                    />
                </PageProp>

                <PageProp getLabel={() => "Turns by itself"}>
                    <PageCheckField
                        getValue={getIsIdlingAllowed}
                        getAriaLabel={() => "Turns by itself"}
                        onChange={setIsIdlingAllowed}
                    />
                </PageProp>

                <PageProp getLabel={() => "Idle step delay (ms)"}>
                    <PageNumberField
                        getValue={getIdleDelayMs}
                        getMin={() => MIN_IDLE_DELAY_MS}
                        getMax={() => MAX_IDLE_DELAY_MS}
                        getStep={() => IDLE_DELAY_STEP_MS}
                        getWidth={() => FIELD_WIDTH}
                        getIsDisabled={() => !getIsIdlingAllowed()}
                        getAriaLabel={() => "Idle step delay"}
                        onInput={setIdleDelayMs}
                    />
                </PageProp>

                <PageProp getLabel={() => "Spin style"}>
                    <PageSelectField
                        getValue={getSpinStyleKey}
                        getValues={() => SPIN_STYLE_KEYS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Spin style"}
                        onChange={(key) => setSpinStyleKey(() => key)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </>
    );
};
