import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { SplitPane } from "../../../../Lib/Fundamentals/SplitPane/SplitPane";
import type { SplitPaneEntry } from "../../../../Lib/Fundamentals/SplitPane/SplitPane.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import {
    PageSplitPaneBox,
    PageSplitPaneFrame,
    PageSplitPaneGutter,
} from "../../StyledComponents/SplitPaneContent/SplitPaneContent";

const PAIR: SplitPaneEntry[] = [
    { id: "split-pair-start", gutterAriaLabel: "Resize navigation" },
    { id: "split-pair-end" },
];

const BOUNDED: SplitPaneEntry[] = [
    { id: "split-bounded-start", minPx: 120, maxPx: 220, gutterAriaLabel: "Resize sidebar" },
    { id: "split-bounded-end", minPx: 160 },
];

const CRAMPED: SplitPaneEntry[] = [
    { id: "split-cramped-start", minPx: 250, gutterAriaLabel: "Resize left" },
    { id: "split-cramped-end", minPx: 400 },
];

const TRIPLE: SplitPaneEntry[] = [
    { id: "split-triple-start", minPx: 80, gutterAriaLabel: "Resize first" },
    { id: "split-triple-middle", minPx: 80, gutterAriaLabel: "Resize second" },
    { id: "split-triple-end", minPx: 80 },
];

const MIN_GUTTER = 2;
const MAX_GUTTER = 24;
const GUTTER_STEP = 1;
const STARTING_GUTTER = 8;
const GUTTER_FIELD_WIDTH = 90;
const CRAMPED_WIDTH = 600;

const STARTING_PAIR = [0.3, 0.7];
const STARTING_BOUNDED = [0.3, 0.7];
const STARTING_CRAMPED = [0.5, 0.5];
const STARTING_TRIPLE = [0.25, 0.5, 0.25];
const STARTING_COLUMN = [0.4, 0.6];

const percent = (ratios: number[]) => ratios.map((ratio) => `${Math.round(ratio * 100)}%`).join(" / ");

export const SplitPanePage = () => {
    const [getGutterSize, setGutterSize] = createSignal(STARTING_GUTTER);
    const [getIsDisabled, setIsDisabled] = createSignal(false);

    const pairSignal = createSignal(STARTING_PAIR);
    const boundedSignal = createSignal(STARTING_BOUNDED);
    const crampedSignal = createSignal(STARTING_CRAMPED);
    const tripleSignal = createSignal(STARTING_TRIPLE);
    const columnSignal = createSignal(STARTING_COLUMN);

    const reset = () => {
        pairSignal[1](STARTING_PAIR);
        boundedSignal[1](STARTING_BOUNDED);
        crampedSignal[1](STARTING_CRAMPED);
        tripleSignal[1](STARTING_TRIPLE);
        columnSignal[1](STARTING_COLUMN);
    };

    const getVariants = createMemo(() => {
        return [
            {
                key: "pair",
                name: "Two panes",
                readout: () => `ratios: ${percent(pairSignal[0]())} — drag the gutter or arrow it with the keyboard`,
                component: () => (
                    <PageSplitPaneFrame>
                        <SplitPane
                            getPanes={() => PAIR}
                            ratiosSignal={pairSignal}
                            getGutterSize={getGutterSize}
                            getIsDisabled={getIsDisabled}
                            getAriaLabel={() => "Two panes"}
                            renderPane={(_getPane, index) => (
                                <PageSplitPaneBox>{index === 0 ? "Navigation" : "Content"}</PageSplitPaneBox>
                            )}
                            renderGutter={(getFlags) => (
                                <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />
                            )}
                        />
                    </PageSplitPaneFrame>
                ),
            },
            {
                key: "bounded",
                name: "Bounded panes",
                readout: () =>
                    `ratios: ${percent(boundedSignal[0]())} — the first pane is held between 120px and 220px whatever the ratio says`,
                component: () => (
                    <PageSplitPaneFrame>
                        <SplitPane
                            getPanes={() => BOUNDED}
                            ratiosSignal={boundedSignal}
                            getGutterSize={getGutterSize}
                            getIsDisabled={getIsDisabled}
                            getAriaLabel={() => "Bounded panes"}
                            renderPane={(_getPane, index) => (
                                <PageSplitPaneBox>
                                    {index === 0 ? "Sidebar 120–220px" : "Content min 160px"}
                                </PageSplitPaneBox>
                            )}
                            renderGutter={(getFlags) => (
                                <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />
                            )}
                        />
                    </PageSplitPaneFrame>
                ),
            },
            {
                key: "triple",
                name: "Three panes",
                readout: () =>
                    `ratios: ${percent(tripleSignal[0]())} — a gutter moves its two neighbours and nothing else`,
                component: () => (
                    <PageSplitPaneFrame>
                        <SplitPane
                            getPanes={() => TRIPLE}
                            ratiosSignal={tripleSignal}
                            getGutterSize={getGutterSize}
                            getIsDisabled={getIsDisabled}
                            getAriaLabel={() => "Three panes"}
                            renderPane={(_getPane, index) => <PageSplitPaneBox>Pane {index + 1}</PageSplitPaneBox>}
                            renderGutter={(getFlags) => (
                                <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />
                            )}
                        />
                    </PageSplitPaneFrame>
                ),
            },
            {
                key: "stacked",
                name: "Stacked",
                readout: () => `ratios: ${percent(columnSignal[0]())} — the same control on the other axis`,
                component: () => (
                    <PageSplitPaneFrame>
                        <SplitPane
                            getPanes={() => PAIR}
                            ratiosSignal={columnSignal}
                            getDir={() => "column"}
                            getGutterSize={getGutterSize}
                            getIsDisabled={getIsDisabled}
                            getAriaLabel={() => "Stacked panes"}
                            renderPane={(_getPane, index) => (
                                <PageSplitPaneBox>{index === 0 ? "Top" : "Bottom"}</PageSplitPaneBox>
                            )}
                            renderGutter={(getFlags) => (
                                <PageSplitPaneGutter getFlags={getFlags} getDir={() => "column"} />
                            )}
                        />
                    </PageSplitPaneFrame>
                ),
            },
            {
                key: "cramped",
                name: "Minimums that do not fit",
                readout: () =>
                    `minimums of 250px and 400px in a box too narrow for both — grid honours the floors and lets the row overflow, which is the behaviour this control inherits rather than fights`,
                component: () => (
                    <div style={{ "width": `${CRAMPED_WIDTH}px`, "overflow-x": "auto" }}>
                        <PageSplitPaneFrame>
                            <SplitPane
                                getPanes={() => CRAMPED}
                                ratiosSignal={crampedSignal}
                                getGutterSize={getGutterSize}
                                getIsDisabled={getIsDisabled}
                                getAriaLabel={() => "Cramped panes"}
                                renderPane={(_getPane, index) => (
                                    <PageSplitPaneBox>{index === 0 ? "min 250px" : "min 400px"}</PageSplitPaneBox>
                                )}
                                renderGutter={(getFlags) => (
                                    <PageSplitPaneGutter getFlags={getFlags} getDir={() => "row"} />
                                )}
                            />
                        </PageSplitPaneFrame>
                    </div>
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "gutterSize"} getLabel={() => "Gutter size"}>
                    <PageNumberField
                        getValue={getGutterSize}
                        getMin={() => MIN_GUTTER}
                        getMax={() => MAX_GUTTER}
                        getStep={() => GUTTER_STEP}
                        getWidth={() => GUTTER_FIELD_WIDTH}
                        getAriaLabel={() => "Gutter size"}
                        onInput={setGutterSize}
                    />
                </PageProp>

                <PageProp getKey={() => "isDisabled"} getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>

                <PageProp getKey={() => "ratios"} getLabel={() => "Ratios"}>
                    <Button
                        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Reset</PageButtonContent>}
                        onClick={async () => {
                            reset();
                        }}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
