import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageTabContent, PageTabFloater, PageTabPanel } from "../../../StyledComponents/TabContent/TabContent";
import { COLUMN_TABS, PANEL_BODIES, getPanelId, getTabId } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

import * as styles from "../TabsPage.css";

type Props = TabsExampleProps;

export const ColumnExample = (props: Props) => {
    return (
        <div class={styles.columnDemo}>
            <Tabs
                dir={"column"}
                ariaLabel={"Example sections"}
                tabs={() => COLUMN_TABS}
                selectedValue={props.selectedValue}
                onSelectionChange={props.onSelectionChange}
                renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageTabFloater
                        dir={"column"}
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderTab={(getTab, getFlags) => (
                    <PageTabContent
                        flags={getFlags}
                        dir={"column"}
                        isSelected={() => getTab().value === access(props.selectedValue)}
                    >
                        {getTab().value}
                    </PageTabContent>
                )}
            />

            <div class={styles.columnDemoPanel}>
                <PageTabPanel
                    id={() => getPanelId("column", access(props.selectedValue) ?? "")}
                    tabId={() => getTabId("column", access(props.selectedValue) ?? "")}
                >
                    {PANEL_BODIES[access(props.selectedValue) ?? ""]}
                </PageTabPanel>
            </div>
        </div>
    );
};
