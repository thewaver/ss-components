import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import { BoundedExample } from "./Examples/Bounded";
import { CrampedExample } from "./Examples/Cramped";
import { PairExample } from "./Examples/Pair";
import { StackedExample } from "./Examples/Stacked";
import { TripleExample } from "./Examples/Triple";
import type { SplitPaneExampleProps } from "./SplitPanePage.types";

const MIN_GUTTER = 2;
const MAX_GUTTER = 24;
const GUTTER_STEP = 1;
const STARTING_GUTTER = 8;
const GUTTER_FIELD_WIDTH = 90;
const PERCENT = 100;
const MIN_COLUMN_WIDTH = 420;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/SplitPanePage/Examples";

const STARTING_PAIR = [0.3, 0.7];
const STARTING_BOUNDED = [0.3, 0.7];
const STARTING_CRAMPED = [0.5, 0.5];
const STARTING_TRIPLE = [0.25, 0.5, 0.25];
const STARTING_COLUMN = [0.4, 0.6];

const percent = (ratios: number[]) => ratios.map((ratio) => `${Math.round(ratio * PERCENT)}%`).join(" / ");

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

    const getExamples = createMemo(() => {
        const commonProps: Omit<SplitPaneExampleProps, "ratiosSignal"> = { getGutterSize, getIsDisabled };

        return [
            {
                key: "pair",
                name: "Two panes",
                readout: () => `ratios: ${percent(pairSignal[0]())} — drag the gutter or arrow it with the keyboard`,
                component: () => <PairExample {...commonProps} ratiosSignal={pairSignal} />,
                path: `${EXAMPLES_ROOT}/Pair.tsx`,
            },
            {
                key: "bounded",
                name: "Bounded panes",
                readout: () =>
                    `ratios: ${percent(boundedSignal[0]())} — the first pane is held between 120px and 220px whatever the ratio says`,
                component: () => <BoundedExample {...commonProps} ratiosSignal={boundedSignal} />,
                path: `${EXAMPLES_ROOT}/Bounded.tsx`,
            },
            {
                key: "triple",
                name: "Three panes",
                readout: () =>
                    `ratios: ${percent(tripleSignal[0]())} — a gutter moves its two neighbours and nothing else`,
                component: () => <TripleExample {...commonProps} ratiosSignal={tripleSignal} />,
                path: `${EXAMPLES_ROOT}/Triple.tsx`,
            },
            {
                key: "stacked",
                name: "Stacked",
                readout: () => `ratios: ${percent(columnSignal[0]())} — the same control on the other axis`,
                component: () => <StackedExample {...commonProps} ratiosSignal={columnSignal} />,
                path: `${EXAMPLES_ROOT}/Stacked.tsx`,
            },
            {
                key: "cramped",
                name: "Minimums that do not fit",
                readout: () =>
                    `minimums of 250px and 400px in a box too narrow for both — grid honours the floors and lets the row overflow, which is the behaviour this control inherits rather than fights`,
                component: () => <CrampedExample {...commonProps} ratiosSignal={crampedSignal} />,
                path: `${EXAMPLES_ROOT}/Cramped.tsx`,
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

            <PageExamples getItems={getExamples} getMinColumnWidth={() => MIN_COLUMN_WIDTH} />
        </>
    );
};
