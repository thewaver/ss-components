import type { Accessor } from "solid-js";
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
const MIN_TURNS = 1;
const MAX_TURNS = 10;
const TURNS_STEP = 1;
const MIN_IDLE_DELAY_MS = 1000;
const MAX_IDLE_DELAY_MS = 8000;
const IDLE_DELAY_STEP_MS = 500;
const FIELD_WIDTH = 130;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/WheelPage/Examples";

const STARTING_WEDGE_COUNT = 8;
const STARTING_SPIN_DURATION_MS = 3000;
const STARTING_SETTLE_DURATION_MS = 1500;
const STARTING_REST_DURATION_MS = 3000;
const INDEFINITE_REST_DURATION_MS = -1;
const STARTING_IDLE_DELAY_MS = 3000;
const STARTING_TURNS = 3;

const FLAT_WHEEL_SIZE = 340;
const MIN_LIVELY_TURNS = 1;
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

const rigid: WheelSpinStyleFn = (index, wedgeCount, turns) => ({ turns, jitterRatio: 0 });

const bouncy: WheelSpinStyleFn = (index, wedgeCount, turns) => ({
    turns: MIN_LIVELY_TURNS + Math.floor(Math.random() * (turns - MIN_LIVELY_TURNS + 1)),
    jitterRatio: (Math.random() - 0.5) * LIVELY_JITTER_SPREAD,
});

const SPIN_STYLES = { rigid, bouncy } satisfies Record<string, WheelSpinStyleFn>;

type SpinStyleKey = keyof typeof SPIN_STYLES;

const SPIN_STYLE_KEYS = Object.keys(SPIN_STYLES) as SpinStyleKey[];

const STARTING_SPIN_STYLE_KEY: SpinStyleKey = "bouncy";

const FlatExampleWrapper = (props: WheelExampleProps) => {
    return (
        <PageMeasureBox width={() => FLAT_WHEEL_SIZE}>
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
    const [getTurns, setTurns] = createSignal(STARTING_TURNS);
    const [getSettleDurationMs, setSettleDurationMs] = createSignal(STARTING_SETTLE_DURATION_MS);
    const [getRestDurationMs, setRestDurationMs] = createSignal(STARTING_REST_DURATION_MS);
    const [getDoesResume, setDoesResume] = createSignal(true);
    const [getIdleDelayMs, setIdleDelayMs] = createSignal(STARTING_IDLE_DELAY_MS);
    const [getSpinStyleKey, setSpinStyleKey] = createSignal<SpinStyleKey>(STARTING_SPIN_STYLE_KEY);
    const [getIsDisabled, setIsDisabled] = createSignal(false);
    const [getIsIdlingAllowed, setIsIdlingAllowed] = createSignal(true);

    const flatIndexSignal = createSignal(0);
    const sidewaysIndexSignal = createSignal(0);
    const reelIndexSignal = createSignal(0);

    const [getFlatMarkedIndex, setFlatMarkedIndex] = createSignal(0);
    const [getSidewaysMarkedIndex, setSidewaysMarkedIndex] = createSignal(0);
    const [getReelMarkedIndex, setReelMarkedIndex] = createSignal(0);

    const getWedges = createMemo(() => PRIZES.slice(0, getWedgeCount()));

    const getIdleDelay = () => (getIsIdlingAllowed() ? getIdleDelayMs() : undefined);

    const getRestDuration = () => (getDoesResume() ? getRestDurationMs() : INDEFINITE_REST_DURATION_MS);

    const getReadout = (getMarkedIndex: Accessor<number>, getSettledIndex: Accessor<number>) => () =>
        `under the marker: ${getWedges()[getMarkedIndex()] ?? "nothing"} — settled on: ${getWedges()[getSettledIndex()] ?? "nothing"}`;

    const getExamples = createMemo(() => {
        const commonProps = {
            wedges: getWedges,
            isDisabled: getIsDisabled,
            spinDurationMs: getSpinDurationMs,
            settleDurationMs: getSettleDurationMs,
            restDurationMs: getRestDuration,
            idleDelayMs: getIdleDelay,
            computeSpinDefs: (index: number, wedgeCount: number) =>
                SPIN_STYLES[getSpinStyleKey()](index, wedgeCount, getTurns()),
        };

        return [
            {
                key: "flat",
                name: "Flat, top",
                component: () => (
                    <FlatExampleWrapper
                        {...commonProps}
                        indexSignal={flatIndexSignal}
                        onSelectedWedgeChange={setFlatMarkedIndex}
                    />
                ),
                readout: getReadout(getFlatMarkedIndex, flatIndexSignal[0]),
                path: `${EXAMPLES_ROOT}/Flat.tsx`,
            },
            {
                key: "sideways",
                name: "Drum, horizontal",
                component: () => (
                    <DrumSidewaysExampleWrapper
                        {...commonProps}
                        indexSignal={sidewaysIndexSignal}
                        onSelectedWedgeChange={setSidewaysMarkedIndex}
                    />
                ),
                readout: getReadout(getSidewaysMarkedIndex, sidewaysIndexSignal[0]),
                path: `${EXAMPLES_ROOT}/DrumSideways.tsx`,
            },
            {
                key: "reel",
                name: "Drum, vertical",
                component: () => (
                    <DrumOverExampleWrapper
                        {...commonProps}
                        indexSignal={reelIndexSignal}
                        onSelectedWedgeChange={setReelMarkedIndex}
                    />
                ),
                readout: getReadout(getReelMarkedIndex, reelIndexSignal[0]),
                path: `${EXAMPLES_ROOT}/DrumOver.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"wedgeCount"} label={"Wedges"}>
                    <PageNumberField
                        value={getWedgeCount}
                        min={() => MIN_WEDGE_COUNT}
                        max={() => MAX_WEDGE_COUNT}
                        step={() => WEDGE_COUNT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Wedges"}
                        onInput={setWedgeCount}
                    />
                </PageProp>

                <PageProp key={"spinDurationMs"} label={"Spin duration (ms)"}>
                    <PageNumberField
                        value={getSpinDurationMs}
                        min={() => MIN_DURATION_MS}
                        max={() => MAX_DURATION_MS}
                        step={() => DURATION_STEP_MS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Spin duration"}
                        onInput={setSpinDurationMs}
                    />
                </PageProp>

                <PageProp key={"turns"} label={"Turns per spin"}>
                    <PageNumberField
                        value={getTurns}
                        min={() => MIN_TURNS}
                        max={() => MAX_TURNS}
                        step={() => TURNS_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Turns per spin"}
                        onInput={setTurns}
                    />
                </PageProp>

                <PageProp key={"settleDurationMs"} label={"Settle duration (ms)"}>
                    <PageNumberField
                        value={getSettleDurationMs}
                        min={() => MIN_DURATION_MS}
                        max={() => MAX_DURATION_MS}
                        step={() => DURATION_STEP_MS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Settle duration"}
                        onInput={setSettleDurationMs}
                    />
                </PageProp>

                <PageProp key={"doesResume"} label={"Turns again after a spin"}>
                    <PageCheckField
                        value={getDoesResume}
                        ariaLabel={"Turns again after a spin"}
                        onChange={setDoesResume}
                    />
                </PageProp>

                <PageProp key={"restDurationMs"} label={"Rest after a spin (ms)"}>
                    <PageNumberField
                        value={getRestDurationMs}
                        min={() => MIN_DURATION_MS}
                        max={() => MAX_DURATION_MS}
                        step={() => DURATION_STEP_MS}
                        width={() => FIELD_WIDTH}
                        isDisabled={() => !getDoesResume()}
                        ariaLabel={"Rest after a spin"}
                        onInput={setRestDurationMs}
                    />
                </PageProp>

                <PageProp key={"isIdlingAllowed"} label={"Turns by itself"}>
                    <PageCheckField
                        value={getIsIdlingAllowed}
                        ariaLabel={"Turns by itself"}
                        onChange={setIsIdlingAllowed}
                    />
                </PageProp>

                <PageProp key={"idleDelayMs"} label={"Idle step delay (ms)"}>
                    <PageNumberField
                        value={getIdleDelayMs}
                        min={() => MIN_IDLE_DELAY_MS}
                        max={() => MAX_IDLE_DELAY_MS}
                        step={() => IDLE_DELAY_STEP_MS}
                        width={() => FIELD_WIDTH}
                        isDisabled={() => !getIsIdlingAllowed()}
                        ariaLabel={"Idle step delay"}
                        onInput={setIdleDelayMs}
                    />
                </PageProp>

                <PageProp key={"spinStyleKey"} label={"Spin style"}>
                    <PageSelectField
                        value={getSpinStyleKey}
                        values={() => SPIN_STYLE_KEYS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Spin style"}
                        onChange={(key) => setSpinStyleKey(() => key)}
                    />
                </PageProp>

                <PageProp key={"isDisabled"} label={"Disabled"}>
                    <PageCheckField value={getIsDisabled} ariaLabel={"Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </>
    );
};
