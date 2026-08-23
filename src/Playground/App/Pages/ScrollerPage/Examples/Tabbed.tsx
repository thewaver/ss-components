import { Scroller } from "../../../../../Lib/Fundamentals/Scroller/Scroller";
import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageScrollerButton } from "../../../StyledComponents/ScrollerButton/ScrollerButton";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import type { ScrollerTabbedExampleProps } from "../ScrollerPage.types";

import { FOCUS_RING_WIDTH } from "../../../Theme.css";
import * as styles from "../ScrollerPage.css";

const SCROLLER_GAP = 10;
const TAB_GAP = 10;

type Props = ScrollerTabbedExampleProps;

export const TabbedExample = (props: Props) => {
    return (
        <div class={styles.demo}>
            <Scroller
                gap={() => SCROLLER_GAP}
                padding={() => FOCUS_RING_WIDTH}
                renderButton={(getStep, stepper) => <PageScrollerButton step={getStep} stepper={stepper} />}
            >
                <Tabs
                    dir={"row"}
                    tabGap={() => TAB_GAP}
                    ariaLabel={"Months"}
                    tabs={props.tabs}
                    selectedValue={props.selectedValue}
                    onSelectionChange={props.onSelectionChange}
                    renderGutter={() => <PageTabGutter dir={"row"} />}
                    renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                        <PageTabFloater
                            dir={"row"}
                            visibilityTarget={getVisibilityTarget}
                            transitionDurationMs={getTransitionDurationMs}
                        />
                    )}
                    renderTab={(getTab, getFlags) => (
                        <PageTabContent
                            flags={getFlags}
                            dir={"row"}
                            isSelected={() => getTab().value === access(props.selectedValue)}
                        >
                            {getTab().value}
                        </PageTabContent>
                    )}
                />
            </Scroller>
        </div>
    );
};
