import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import { DISABLED_TABS, ROW_TAB_GAP } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

type Props = TabsExampleProps;

export const AllDisabledExample = (props: Props) => {
    return (
        <Tabs
            dir={"row"}
            tabGap={() => ROW_TAB_GAP}
            ariaLabel={"Unavailable views"}
            tabs={() => DISABLED_TABS}
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
    );
};
