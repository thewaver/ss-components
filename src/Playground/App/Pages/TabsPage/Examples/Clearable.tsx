import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageControlColumn } from "../../../PageComponents/ControlRow/ControlRow";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import { CLEARABLE_TABS, ROW_TAB_GAP } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

export const CLEARABLE_TRANSITION_DURATION_MS = 600;

type Props = TabsExampleProps & { onClear: () => void };

export const ClearableExample = (props: Props) => {
    return (
        <PageControlColumn>
            <Tabs
                dir={"row"}
                tabGap={() => ROW_TAB_GAP}
                ariaLabel={"Clearable views"}
                transitionDurationMs={() => CLEARABLE_TRANSITION_DURATION_MS}
                tabs={() => CLEARABLE_TABS}
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

            <Button
                ariaLabel={"Clear the selection"}
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Clear</PageButtonContent>}
                onClick={async () => props.onClear()}
            />
        </PageControlColumn>
    );
};
