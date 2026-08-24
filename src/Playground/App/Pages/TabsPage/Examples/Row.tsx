import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import {
    PageTabContent,
    PageTabFloater,
    PageTabGutter,
    PageTabPanel,
} from "../../../StyledComponents/TabContent/TabContent";
import { PANEL_BODIES, ROW_TABS, ROW_TAB_GAP, getPanelId, getTabId } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

import * as styles from "../TabsPage.css";

const DEFAULT_ID_PREFIX = "row";

type Props = TabsExampleProps & {
    tabs?: MaybeAccessor<Tab<string>[]>;
    idPrefix?: MaybeAccessor<string>;
};

export const RowExample = (props: Props) => {
    const getIdPrefix = () => access(props.idPrefix) ?? DEFAULT_ID_PREFIX;

    return (
        <div class={styles.rowDemo}>
            <Tabs
                dir={"row"}
                tabGap={() => ROW_TAB_GAP}
                ariaLabel={"Example views"}
                hasAutoActivation={props.hasAutoActivation}
                tabs={() => access(props.tabs) ?? ROW_TABS}
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
                id={() => getPanelId(getIdPrefix(), access(props.selectedValue) ?? "")}
                tabId={() => getTabId(getIdPrefix(), access(props.selectedValue) ?? "")}
            >
                {PANEL_BODIES[access(props.selectedValue) ?? ""]}
            </PageTabPanel>
        </div>
    );
};
