import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Tabs } from "../../../../../Lib/Fundamentals/Tabs/Tabs";
import { PageControlColumn } from "../../../PageComponents/ControlRow/ControlRow";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageTabContent, PageTabFloater, PageTabGutter } from "../../../StyledComponents/TabContent/TabContent";
import { CLEARABLE_TABS, ROW_TAB_GAP } from "../TabsPage.const";
import type { TabsExampleProps } from "../TabsPage.types";

export const CLEARABLE_TRANSITION_DURATION_MS = 600;

type Props = TabsExampleProps & { onClear: () => void };

export const ClearableExample = (props: Props) => (
    <PageControlColumn>
        <Tabs
            getDir={() => "row"}
            getTabGap={() => ROW_TAB_GAP}
            getAriaLabel={() => "Clearable views"}
            getTransitionDurationMs={() => CLEARABLE_TRANSITION_DURATION_MS}
            getTabs={() => CLEARABLE_TABS}
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

        <Button
            getAriaLabel={() => "Clear the selection"}
            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Clear</PageButtonContent>}
            onClick={async () => props.onClear()}
        />
    </PageControlColumn>
);
