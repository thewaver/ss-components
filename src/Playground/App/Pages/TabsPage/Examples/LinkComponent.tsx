import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import type { TabLinkProps } from "../../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import { LINK_TABS, ROW_TAB_GAP } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

const PageTabLink = (props: TabLinkProps) => <a {...props} data-link-component />;

type Props = TabsExampleProps;

export const LinkComponentExample = (props: Props) => (
    <Tabs
        getDir={() => "row"}
        getTabGap={() => ROW_TAB_GAP}
        getAriaLabel={() => "Routed destinations"}
        getTabs={() => LINK_TABS}
        getSelectedValue={props.getSelectedValue}
        onSelectionChange={props.onSelectionChange}
        linkComponent={PageTabLink}
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
);
