import { createMemo, createSignal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { DrumWheel } from "../../../../Lib/Exotics/DrumWheel/DrumWheel";
import { FlatWheel } from "../../../../Lib/Exotics/FlatWheel/FlatWheel";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField, PageNumberField, PageSelectField } from "../../StyledComponents/Field/Field";
import {
    PageWheelBar,
    PageWheelCard,
    PageWheelHub,
    PageWheelSpin,
    PageWheelWedge,
} from "../../StyledComponents/WheelContent/WheelContent";
import type { WheelSpinStyleFn } from "./WheelPage.types";

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

const STARTING_WEDGE_COUNT = 8;
const STARTING_SPIN_DURATION_MS = 3000;
const STARTING_SETTLE_DURATION_MS = 1500;
const STARTING_IDLE_DELAY_MS = 3000;

const PRIZE_FETCH_DELAY_MS = 400;
const FLAT_WHEEL_SIZE = 340;
const SIDEWAYS_DRUM_WEDGE_SIZE: Size2d = { width: 120, height: 74 };
const REEL_DRUM_WEDGE_SIZE: Size2d = { width: 240, height: 56 };
const REEL_TURN_COUNT = 2;
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

const plain: WheelSpinStyleFn = () => ({ turns: PLAIN_TURNS, jitterRatio: 0 });

const lively: WheelSpinStyleFn = () => ({
    turns: MIN_LIVELY_TURNS + Math.floor(Math.random() * (MAX_LIVELY_TURNS - MIN_LIVELY_TURNS + 1)),
    jitterRatio: (Math.random() - 0.5) * LIVELY_JITTER_SPREAD,
});

const SPIN_STYLES = { plain, lively } satisfies Record<string, WheelSpinStyleFn>;

type SpinStyleKey = keyof typeof SPIN_STYLES;

const SPIN_STYLE_KEYS = Object.keys(SPIN_STYLES) as SpinStyleKey[];

const STARTING_SPIN_STYLE_KEY: SpinStyleKey = "lively";

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

    const getReelWedges = createMemo(() => Array.from({ length: REEL_TURN_COUNT }, () => getWedges()).flat());

    const getSpinStyle = createMemo(() => SPIN_STYLES[getSpinStyleKey()]);

    const pickPrizeIndex = (wedgeCount: number) =>
        new Promise<number>((resolve) => {
            setTimeout(() => resolve(Math.floor(Math.random() * wedgeCount)), PRIZE_FETCH_DELAY_MS);
        });

    const getIdleDelay = () => (getIsIdlingAllowed() ? getIdleDelayMs() : undefined);

    const readoutOf = (name: string, index: number, count: number) =>
        `landed on ${name ?? "nothing"} (${index + 1} of ${count}) — it turns by itself until it is spun, and holds while the pointer is over it, while anything inside it has focus, and while the tab is in the background`;

    const getVariants = createMemo(() => [
        {
            name: "Flat",
            readout: () => readoutOf(getWedges()[flatIndexSignal[0]()], flatIndexSignal[0](), getWedgeCount()),
            component: () => (
                <PageMeasureBox getWidth={() => FLAT_WHEEL_SIZE}>
                    <FlatWheel
                        getWedges={getWedges}
                        indexSignal={flatIndexSignal}
                        getIsDisabled={getIsDisabled}
                        getSpinDurationMs={getSpinDurationMs}
                        getSettleDurationMs={getSettleDurationMs}
                        getIdleDelayMs={getIdleDelay}
                        getAriaLabel={() => "Prize wheel"}
                        computeSpinTarget={() => pickPrizeIndex(getWedgeCount())}
                        computeSpinDefs={(index, wedgeCount) => getSpinStyle()(index, wedgeCount)}
                        computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedgeCount()}`}
                        renderWedge={(getWedge, getState) => (
                            <PageWheelWedge getState={getState}>{getWedge()}</PageWheelWedge>
                        )}
                        renderSpin={(getFlags) => <PageWheelSpin getFlags={getFlags} />}
                        renderControls={(controls) => <PageWheelHub>{controls.renderSpin()}</PageWheelHub>}
                    />
                </PageMeasureBox>
            ),
        },
        {
            name: "Drum, turning sideways",
            readout: () => readoutOf(getWedges()[sidewaysIndexSignal[0]()], sidewaysIndexSignal[0](), getWedgeCount()),
            component: () => (
                <PageMeasureBox>
                    <DrumWheel
                        getWedges={getWedges}
                        indexSignal={sidewaysIndexSignal}
                        getIsDisabled={getIsDisabled}
                        getSpinDurationMs={getSpinDurationMs}
                        getSettleDurationMs={getSettleDurationMs}
                        getIdleDelayMs={getIdleDelay}
                        getAxis={() => "row"}
                        getWedgeSize={() => SIDEWAYS_DRUM_WEDGE_SIZE}
                        getAriaLabel={() => "Prize drum, turning sideways"}
                        computeSpinTarget={() => pickPrizeIndex(getWedgeCount())}
                        computeSpinDefs={(index, wedgeCount) => getSpinStyle()(index, wedgeCount)}
                        computeWedgeLabel={(index) => `${getWedges()[index]}, ${index + 1} of ${getWedgeCount()}`}
                        renderWedge={(getWedge, getState) => (
                            <PageWheelCard getState={getState}>{getWedge()}</PageWheelCard>
                        )}
                        renderWedgeBack={(_getWedge, getState) => <PageWheelCard getState={getState} />}
                        renderSpin={(getFlags) => <PageButtonContent getFlags={getFlags}>Spin</PageButtonContent>}
                        renderControls={(controls) => <PageWheelBar>{controls.renderSpin()}</PageWheelBar>}
                    />
                </PageMeasureBox>
            ),
        },
        {
            name: "Drum, turning over",
            readout: () => {
                const index = reelIndexSignal[0]();

                return readoutOf(getReelWedges()[index], index % getWedgeCount(), getWedgeCount());
            },
            component: () => (
                <PageMeasureBox>
                    <DrumWheel
                        getWedges={getReelWedges}
                        indexSignal={reelIndexSignal}
                        getIsDisabled={getIsDisabled}
                        getSpinDurationMs={getSpinDurationMs}
                        getSettleDurationMs={getSettleDurationMs}
                        getIdleDelayMs={getIdleDelay}
                        getAxis={() => "column"}
                        getWedgeSize={() => REEL_DRUM_WEDGE_SIZE}
                        getAriaLabel={() => "Prize drum, turning over"}
                        computeSpinTarget={() => pickPrizeIndex(getReelWedges().length)}
                        computeSpinDefs={(index, wedgeCount) => getSpinStyle()(index, wedgeCount)}
                        computeWedgeLabel={(index) =>
                            `${getReelWedges()[index]}, ${(index % getWedgeCount()) + 1} of ${getWedgeCount()}`
                        }
                        renderWedge={(getWedge, getState) => (
                            <PageWheelCard getState={getState} getRank={() => (getState().index % getWedgeCount()) + 1}>
                                {getWedge()}
                            </PageWheelCard>
                        )}
                        renderWedgeBack={(_getWedge, getState) => <PageWheelCard getState={getState} />}
                        renderSpin={(getFlags) => <PageButtonContent getFlags={getFlags}>Spin</PageButtonContent>}
                        renderControls={(controls) => <PageWheelBar>{controls.renderSpin()}</PageWheelBar>}
                    />
                </PageMeasureBox>
            ),
        },
    ]);

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

            <PageVariants getItems={getVariants} />
        </>
    );
};
