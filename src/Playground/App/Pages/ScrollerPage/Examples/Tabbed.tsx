import { Scroller } from "../../../../../Lib/Fundamentals/Scroller/Scroller";
import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { PageScrollerButton } from "../../../StyledComponents/ScrollerButton/ScrollerButton";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import type { ScrollerTabbedExampleProps } from "../ScrollerPage.types";

import { FOCUS_RING_WIDTH } from "../../../Theme.css";
import * as styles from "../ScrollerPage.css";

const SCROLLER_GAP = 10;
const TAB_GAP = 10;

type Props = ScrollerTabbedExampleProps;

export const TabbedExample = (props: Props) => (
    <div class={styles.demo}>
        <Scroller
            getGap={() => SCROLLER_GAP}
            getPadding={() => FOCUS_RING_WIDTH}
            renderButton={(getStep, stepper) => <PageScrollerButton getStep={getStep} stepper={stepper} />}
        >
            <Tabs
                getDir={() => "row"}
                getTabGap={() => TAB_GAP}
                getAriaLabel={() => "Months"}
                getTabs={props.getTabs}
                getSelectedValue={props.getSelectedValue}
                onSelectionChange={props.onSelectionChange}
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
                        getIsSelected={() => getTab().value === props.getSelectedValue()}
                    >
                        {getTab().value}
                    </PageTabContent>
                )}
            />
        </Scroller>
    </div>
);
