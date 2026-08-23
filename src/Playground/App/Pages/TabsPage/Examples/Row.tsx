import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { access } from "../../../../../Lib/Utils/propUtils";
import {
    PageTabContent,
    PageTabFloater,
    PageTabGutter,
    PageTabPanel,
} from "../../../StyledComponents/TabContent/TabContent";
import { PANEL_BODIES, ROW_TABS, ROW_TAB_GAP, getPanelId, getTabId } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

import * as styles from "../TabsPage.css";

type Props = TabsExampleProps;

export const RowExample = (props: Props) => {
    return (
        <div class={styles.rowDemo}>
            <Tabs
                dir={"row"}
                tabGap={() => ROW_TAB_GAP}
                ariaLabel={"Example views"}
                tabs={() => ROW_TABS}
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

            <PageTabPanel
                id={() => getPanelId("row", access(props.selectedValue) ?? "")}
                tabId={() => getTabId("row", access(props.selectedValue) ?? "")}
            >
                {PANEL_BODIES[access(props.selectedValue) ?? ""]}
            </PageTabPanel>
        </div>
    );
};
