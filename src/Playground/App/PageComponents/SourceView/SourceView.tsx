import { Show, createEffect, createMemo, createSignal } from "solid-js";

import { useViewportContext } from "../../../../Lib/Exotics/Viewport/Viewport.context";
import { Accordion } from "../../../../Lib/Fundamentals/Accordion/Accordion";
import type { AccordionItem } from "../../../../Lib/Fundamentals/Accordion/Accordion.types";
import { Scroller } from "../../../../Lib/Fundamentals/Scroller/Scroller";
import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
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
        const path = props.getPath();
        const sampleKeys = props.getSampleKeys?.() ?? [];
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
                        getGap={() => TAB_GAP}
                        getPadding={() => FOCUS_RING_WIDTH}
                        renderButton={(getStep, stepper) => <PageScrollerButton getStep={getStep} stepper={stepper} />}
                    >
                        <Tabs
                            getDir={() => "row"}
                            getTabGap={() => TAB_GAP}
                            getAriaLabel={() => "Source files"}
                            getTabs={getTabs}
                            getSelectedValue={getSelectedGroup}
                            onSelectionChange={selectGroup}
                            renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                            renderFloater={() => <PageTabFloater getDir={() => "row"} />}
                            renderTab={(getTab, getFlags) => (
                                <PageTabContent
                                    getFlags={getFlags}
                                    getDir={() => "row"}
                                    getIsSelected={() => getTab().value === getSelectedGroup()}
                                >
                                    {getTab().value.name}
                                </PageTabContent>
                            )}
                        />
                    </Scroller>
                </div>

                <div class={styles.sourceViewPanel}>
                    <PageTabPanel
                        getId={() => getPanelId(getSelectedGroup()!.name)}
                        getTabId={() => getTabId(getSelectedGroup()!.name)}
                    >
                        <Accordion
                            getItems={getItems}
                            expandedSignal={expandedSignal}
                            getGap={() => SECTION_GAP}
                            renderHeader={(getItem, getFlags) => (
                                <PageAccordionHeader getFlags={getFlags}>{getItem().value}</PageAccordionHeader>
                            )}
                            renderPanel={(getItem, getVisibilityTarget, getTransitionDurationMs) => (
                                <PageAccordionPanel
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    <PageCodeBox getSource={() => getSource(getItem().value)} />
                                </PageAccordionPanel>
                            )}
                        />
                    </PageTabPanel>
                </div>
            </div>
        </Show>
    );
};
