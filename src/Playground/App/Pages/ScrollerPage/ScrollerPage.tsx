import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Scroller } from "../../../../Lib/Fundamentals/Scroller/Scroller";
import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageNumberField } from "../../StyledComponents/Field/Field";
import { PageScrollerButton } from "../../StyledComponents/ScrollerButton/ScrollerButton";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../StyledComponents/TabContent/TabContent";

import { FOCUS_RING_WIDTH } from "../../Theme.css";
import * as styles from "./ScrollerPage.css";

const MIN_ITEM_COUNT = 1;
const MAX_ITEM_COUNT = 40;
const ITEM_COUNT_STEP = 1;
const STARTING_ITEM_COUNT = 12;
const SCROLLER_GAP = 10;
const TAB_GAP = 10;

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

    const getLabels = createMemo(() => Array.from({ length: getItemCount() }, (_, index) => `Item ${index + 1}`));

    const getMonthTabs = createMemo((): Tab<string>[] =>
        MONTHS.slice(0, getItemCount()).map((month) => ({ value: month })),
    );

    const getVariants = createMemo(() => {
        return [
            {
                name: "One button at each end",
                readout: () =>
                    `${getItemCount()} items — the buttons stop at the ends rather than wrapping round, and leave altogether once everything fits`,
                component: () => (
                    <div class={styles.demo}>
                        <Scroller
                            getGap={() => SCROLLER_GAP}
                            getPadding={() => FOCUS_RING_WIDTH}
                            renderButton={(getStep, stepper) => (
                                <PageScrollerButton getStep={getStep} stepper={stepper} />
                            )}
                        >
                            {getLabels().map((label) => (
                                <div class={styles.chip}>{label}</div>
                            ))}
                        </Scroller>
                    </div>
                ),
            },
            {
                name: "Both buttons at the end",
                readout: () => "the same control with its buttons together instead of split",
                component: () => (
                    <div class={styles.demo}>
                        <Scroller
                            getGap={() => SCROLLER_GAP}
                            getPadding={() => FOCUS_RING_WIDTH}
                            getButtonPlacement={() => "end"}
                            renderButton={(getStep, stepper) => (
                                <PageScrollerButton getStep={getStep} stepper={stepper} />
                            )}
                        >
                            {getLabels().map((label) => (
                                <div class={styles.chip}>{label}</div>
                            ))}
                        </Scroller>
                    </div>
                ),
            },
            {
                name: "Both buttons at the start",
                readout: () => "and the same pair on the other side",
                component: () => (
                    <div class={styles.demo}>
                        <Scroller
                            getGap={() => SCROLLER_GAP}
                            getPadding={() => FOCUS_RING_WIDTH}
                            getButtonPlacement={() => "start"}
                            renderButton={(getStep, stepper) => (
                                <PageScrollerButton getStep={getStep} stepper={stepper} />
                            )}
                        >
                            {getLabels().map((label) => (
                                <div class={styles.chip}>{label}</div>
                            ))}
                        </Scroller>
                    </div>
                ),
            },
            {
                name: "Focus reveals what it lands on",
                readout: () =>
                    `selected: ${getSelectedMonth()} — a tab already fully in view does not move the strip, and one cut off by the edge scrolls into view whole`,
                component: () => (
                    <div class={styles.demo}>
                        <Scroller
                            getGap={() => SCROLLER_GAP}
                            getPadding={() => FOCUS_RING_WIDTH}
                            renderButton={(getStep, stepper) => (
                                <PageScrollerButton getStep={getStep} stepper={stepper} />
                            )}
                        >
                            <Tabs
                                getDir={() => "row"}
                                getTabGap={() => TAB_GAP}
                                getAriaLabel={() => "Months"}
                                getTabs={getMonthTabs}
                                getSelectedValue={getSelectedMonth}
                                onSelectionChange={setSelectedMonth}
                                renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                                renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                                    <PageTabFloater
                                        getDir={() => "row"}
                                        getVisibilityTarget={getVisibilityTarget}
                                        getTransitionDurationMs={getTransitionDurationMs}
                                    />
                                )}
                                renderTab={(getTab, getFlags) => (
                                    <PageTabContent
                                        getFlags={getFlags}
                                        getDir={() => "row"}
                                        getIsSelected={() => getTab().value === getSelectedMonth()}
                                    >
                                        {getTab().value}
                                    </PageTabContent>
                                )}
                            />
                        </Scroller>
                    </div>
                ),
            },
            {
                name: "Focusable children of any kind",
                readout: () => "the track holds whatever it is given, and tabbing through pulls the strip along",
                component: () => (
                    <div class={styles.demo}>
                        <Scroller
                            getGap={() => SCROLLER_GAP}
                            getPadding={() => FOCUS_RING_WIDTH}
                            renderButton={(getStep, stepper) => (
                                <PageScrollerButton getStep={getStep} stepper={stepper} />
                            )}
                        >
                            {getLabels().map((label) => (
                                <Button
                                    renderContent={(getFlags) => (
                                        <PageButtonContent getFlags={getFlags}>{label}</PageButtonContent>
                                    )}
                                />
                            ))}
                        </Scroller>
                    </div>
                ),
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Item count"}>
                    <PageNumberField
                        getValue={getItemCount}
                        getMin={() => MIN_ITEM_COUNT}
                        getMax={() => MAX_ITEM_COUNT}
                        getStep={() => ITEM_COUNT_STEP}
                        getAriaLabel={() => "Item count"}
                        onInput={setItemCount}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </div>
    );
};
