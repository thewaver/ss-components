import { Show, createEffect, createMemo, createSignal } from "solid-js";

import { useViewportContext } from "../../../../Lib/Exotics/Viewport/Viewport.context";
import { Accordion } from "../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { Scroller } from "../../../../Lib/Fundamentals/Scroller/Scroller";
import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageAccordionHeader, PageAccordionPanel } from "../../StyledComponents/AccordionContent/AccordionContent";
import { PageScrollerButton } from "../../StyledComponents/ScrollerButton/ScrollerButton";
import {
    PageTabContent,
    PageTabFloater,
    PageTabGutter,
    PageTabPanel,
} from "../../StyledComponents/TabContent/TabContent";
import { PageCodeBox } from "../CodeBox/CodeBox";
import type { SourceGroup, SourceViewProps } from "./SourceView.types";
import { SourceViewUtils } from "./SourceView.utils";

import { FOCUS_RING_WIDTH } from "../../Theme.css";
import * as styles from "./SourceView.css";

const TAB_GAP = 10;
const SECTION_GAP = 5;
const MODAL_MARGIN_HEIGHT = 80;

const getTabId = (name: string) => `source-tab-${name}`;

const getPanelId = (name: string) => `source-panel-${name}`;

export const PageSourceView = (props: SourceViewProps) => {
    const viewportContext = useViewportContext();

    let loadToken = 0;

    const [getGroups, setGroups] = createSignal<SourceGroup[]>([]);
    const [getSelectedGroup, setSelectedGroup] = createSignal<SourceGroup>();

    const expandedSignal = createSignal<string[]>([]);
    const [, setExpandedNames] = expandedSignal;

    const selectGroup = (group: SourceGroup | undefined) => {
        setSelectedGroup(() => group);
        setExpandedNames(group?.expandedNames ?? []);
    };

    const getTabs = createMemo((): Tab<SourceGroup>[] =>
        getGroups().map((group) => ({
            value: group,
            id: getTabId(group.name),
            panelId: getPanelId(group.name),
        })),
    );

    const getItems = createMemo((): AccordionItem<string>[] =>
        (getSelectedGroup()?.files ?? []).map((file) => ({ value: file.name })),
    );

    const getSource = (name: string) => getSelectedGroup()?.files.find((file) => file.name === name)?.source ?? "";

    createEffect(() => {
        const path = access(props.path);
        const sampleKeys = access(props.sampleKeys) ?? [];
        const token = ++loadToken;

        void SourceViewUtils.loadGroups(path, sampleKeys).then((groups) => {
            if (token !== loadToken) return;

            setGroups(groups);
            selectGroup(groups[0]);
        });
    });

    return (
        <Show when={getSelectedGroup()}>
            <div
                class={styles.sourceViewRoot}
                style={{ "max-height": `${viewportContext.getSize().height - MODAL_MARGIN_HEIGHT}px` }}
            >
                <div class={styles.sourceViewTabs}>
                    <Scroller
                        gap={() => TAB_GAP}
                        padding={() => FOCUS_RING_WIDTH}
                        renderButton={(getStep, stepper) => <PageScrollerButton step={getStep} stepper={stepper} />}
                    >
                        <Tabs
                            dir={"row"}
                            tabGap={() => TAB_GAP}
                            ariaLabel={"Source files"}
                            tabs={getTabs}
                            selectedValue={getSelectedGroup}
                            onSelectionChange={selectGroup}
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
                                    isSelected={() => getTab().value === getSelectedGroup()}
                                >
                                    {getTab().value.name}
                                </PageTabContent>
                            )}
                        />
                    </Scroller>
                </div>

                <div class={styles.sourceViewPanel}>
                    <PageTabPanel
                        id={() => getPanelId(getSelectedGroup()!.name)}
                        tabId={() => getTabId(getSelectedGroup()!.name)}
                    >
                        <Accordion
                            items={getItems}
                            expandedSignal={expandedSignal}
                            gap={() => SECTION_GAP}
                            renderHeader={(getItem, getFlags) => (
                                <PageAccordionHeader flags={getFlags}>{getItem().value}</PageAccordionHeader>
                            )}
                            renderPanel={(getItem, getVisibilityTarget, getTransitionDurationMs) => (
                                <PageAccordionPanel
                                    visibilityTarget={getVisibilityTarget}
                                    transitionDurationMs={getTransitionDurationMs}
                                >
                                    <PageCodeBox source={() => getSource(getItem().value)} />
                                </PageAccordionPanel>
                            )}
                        />
                    </PageTabPanel>
                </div>
            </div>
        </Show>
    );
};
