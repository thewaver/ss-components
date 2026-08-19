import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { PageTabContent, PageTabFloater, PageTabPanel } from "../../../StyledComponents/TabContent/TabContent";
import { COLUMN_TABS, PANEL_BODIES, getPanelId, getTabId } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

import * as styles from "../TabsPage.css";

type Props = TabsExampleProps;

export const ColumnExample = (props: Props) => (
    <div class={styles.columnDemo}>
        <Tabs
            getDir={() => "column"}
            getAriaLabel={() => "Example sections"}
            getTabs={() => COLUMN_TABS}
            getSelectedValue={props.getSelectedValue}
            onSelectionChange={props.onSelectionChange}
            renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageTabFloater
                    getDir={() => "column"}
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                />
            )}
            renderTab={(getTab, getFlags) => (
                <PageTabContent
                    getFlags={getFlags}
                    getDir={() => "column"}
                    getIsSelected={() => getTab().value === props.getSelectedValue()}
                >
                    {getTab().value}
                </PageTabContent>
            )}
        />

        <div class={styles.columnDemoPanel}>
            <PageTabPanel
                getId={() => getPanelId("column", props.getSelectedValue() ?? "")}
                getTabId={() => getTabId("column", props.getSelectedValue() ?? "")}
            >
                {PANEL_BODIES[props.getSelectedValue() ?? ""]}
            </PageTabPanel>
        </div>
    </div>
);
