import { createMemo, createSignal } from "solid-js";

import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageNumberField } from "../../StyledComponents/Field/Field";
import { ChipsExample } from "./Examples/Chips";
import { FocusableChildrenExample } from "./Examples/FocusableChildren";
import { TabbedExample } from "./Examples/Tabbed";

import * as styles from "./ScrollerPage.css";

const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 40;
const ITEM_COUNT_STEP = 1;
const STARTING_ITEM_COUNT = 12;
const MIN_COLUMN_WIDTH = 460;
const MIN_POSITION = 0;
const POSITION_STEP = 10;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ScrollerPage/Examples";
const PERCENT = 100;

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const ScrollerPage = () => {
    const [getItemCount, setItemCount] = createSignal(STARTING_ITEM_COUNT);
    const [getSelectedMonth, setSelectedMonth] = createSignal(MONTHS[0]);
    const progressSignal = createSignal(0);

    const getLabels = createMemo(() => Array.from({ length: getItemCount() }, (_, index) => `Item ${index + 1}`));

    const getMonthTabs = createMemo((): Tab<string>[] =>
        MONTHS.slice(0, getItemCount()).map((month) => ({ value: month })),
    );

    const getExamples = createMemo(() => [
        {
            key: "split",
            name: "One button at each end",
            readout: () =>
                `${getItemCount()} items, ${Math.round(progressSignal[0]() * PERCENT)}% along — the buttons stop at the ends rather than wrapping round, and leave altogether once everything fits`,
            component: () => <ChipsExample labels={getLabels} progressSignal={progressSignal} />,
            path: `${EXAMPLES_ROOT}/Chips.tsx`,
        },
        {
            key: "bothButtonsEnd",
            name: "Both buttons at the end",
            readout: () => "the same control with its buttons together instead of split",
            component: () => <ChipsExample labels={getLabels} buttonPlacement={"end"} />,
            path: `${EXAMPLES_ROOT}/Chips.tsx`,
        },
        {
            key: "bothButtonsStart",
            name: "Both buttons at the start",
            readout: () => "and the same pair on the other side",
            component: () => <ChipsExample labels={getLabels} buttonPlacement={"start"} />,
            path: `${EXAMPLES_ROOT}/Chips.tsx`,
        },
        {
            key: "tabbed",
            name: "Focus reveals what it lands on",
            readout: () =>
                `selected: ${getSelectedMonth()} — a tab already fully in view does not move the strip, and one cut off by the edge scrolls into view whole`,
            component: () => (
                <TabbedExample
                    tabs={getMonthTabs}
                    selectedValue={getSelectedMonth}
                    onSelectionChange={setSelectedMonth}
                />
            ),
            path: `${EXAMPLES_ROOT}/Tabbed.tsx`,
        },
        {
            key: "focusableChildren",
            name: "Focusable children of any kind",
            readout: () => "the track holds whatever it is given, and tabbing through pulls the strip along",
            component: () => <FocusableChildrenExample labels={getLabels} />,
            path: `${EXAMPLES_ROOT}/FocusableChildren.tsx`,
        },
    ]);

    return (
        <div class={styles.root}>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"itemCount"} label={"Item count"}>
                    <PageNumberField
                        value={getItemCount}
                        min={() => MIN_ITEM_COUNT}
                        max={() => MAX_ITEM_COUNT}
                        step={() => ITEM_COUNT_STEP}
                        ariaLabel={"Item count"}
                        onInput={setItemCount}
                    />
                </PageProp>

                <PageProp key={"position"} label={"First strip (%)"}>
                    <PageNumberField
                        value={() => Math.round(progressSignal[0]() * PERCENT)}
                        min={() => MIN_POSITION}
                        max={() => PERCENT}
                        step={() => POSITION_STEP}
                        ariaLabel={"First strip position"}
                        onInput={(value) => progressSignal[1](value / PERCENT)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} minColumnWidth={() => MIN_COLUMN_WIDTH} />
        </div>
    );
};
