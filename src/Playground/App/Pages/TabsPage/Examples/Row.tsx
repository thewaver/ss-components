import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
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

export const RowExample = (props: Props) => (
    <div class={styles.rowDemo}>
        <Tabs
            getDir={() => "row"}
            getTabGap={() => ROW_TAB_GAP}
            getAriaLabel={() => "Example views"}
            getTabs={() => ROW_TABS}
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

        <PageTabPanel
            getId={() => getPanelId("row", props.getSelectedValue() ?? "")}
            getTabId={() => getTabId("row", props.getSelectedValue() ?? "")}
        >
            {PANEL_BODIES[props.getSelectedValue() ?? ""]}
        </PageTabPanel>
    </div>
);
