import { createMemo, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab, TabLinkProps } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import {
    PageTabContent,
    PageTabFloater,
    PageTabGutter,
    PageTabPanel,
} from "../../StyledComponents/TabContent/TabContent";

import * as styles from "./TabsPage.css";

const getTabId = (prefix: string, value: string) => `${prefix}-tab-${value.toLocaleLowerCase()}`;

const getPanelId = (prefix: string, value: string) => `${prefix}-panel-${value.toLocaleLowerCase()}`;

const withIds = (prefix: string, tabs: Tab<string>[]): Tab<string>[] =>
    tabs.map((tab) => ({
        ...tab,
        id: getTabId(prefix, tab.value),
        panelId: getPanelId(prefix, tab.value),
    }));

const ROW_TABS = withIds("row", [
    { value: "Render" },
    { value: "Source" },
    { value: "Metrics", isDisabled: true },
    { value: "Export" },
]);

const COLUMN_TABS = withIds("column", [
    { value: "Overview" },
    { value: "Details" },
    { value: "History", isDisabled: true },
    { value: "Settings" },
]);

const LINK_TABS: Tab<string>[] = [
    { value: "Docs", href: "#tabs-docs" },
    { value: "Guides", href: "#tabs-guides" },
    { value: "Blog", href: "#tabs-blog" },
];

const DISABLED_TABS: Tab<string>[] = [
    { value: "Draft", isDisabled: true },
    { value: "Review", isDisabled: true },
    { value: "Publish", isDisabled: true },
];

const PANEL_BODIES: Record<string, string> = {
    Render: "The component itself, drawn with whatever the props panel currently says.",
    Source: "The code behind it, which is a second panel over the same tab list.",
    Metrics: "Disabled, so the keyboard walks past it and a click does nothing.",
    Export: "A copy of the source, ready to paste elsewhere.",
    Overview: "What the section is for, in one paragraph.",
    Details: "The long version, which is why this list is a column rather than a row.",
    History: "Disabled, so nothing reaches this panel.",
    Settings: "The knobs, which nobody reads until something goes wrong.",
};

const ROW_TAB_GAP = 10;

const PageTabLink = (props: TabLinkProps) => <a {...props} data-link-component />;

export const TabsPage = () => {
    const [getRowValue, setRowValue] = createSignal("Render");
    const [getColumnValue, setColumnValue] = createSignal("Overview");
    const [getLinkValue, setLinkValue] = createSignal("Docs");
    const [getCustomLinkValue, setCustomLinkValue] = createSignal("Docs");
    const [getDisabledValue, setDisabledValue] = createSignal("Draft");

    const getVariants = createMemo(() => {
        return [
            {
                name: "A row of tabs",
                readout: () => `selected: ${getRowValue()}`,
                component: () => (
                    <div class={styles.rowDemo}>
                        <Tabs
                            getDir={() => "row"}
                            getTabGap={() => ROW_TAB_GAP}
                            getAriaLabel={() => "Example views"}
                            getTabs={() => ROW_TABS}
                            getSelectedValue={getRowValue}
                            onSelectionChange={setRowValue}
                            renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                            renderFloater={() => <PageTabFloater getDir={() => "row"} />}
                            renderTab={(getTab, getFlags) => (
                                <PageTabContent
                                    getFlags={getFlags}
                                    getDir={() => "row"}
                                    getIsSelected={() => getTab().value === getRowValue()}
                                >
                                    {getTab().value}
                                </PageTabContent>
                            )}
                        />

                        <PageTabPanel
                            getId={() => getPanelId("row", getRowValue())}
                            getTabId={() => getTabId("row", getRowValue())}
                        >
                            {PANEL_BODIES[getRowValue()]}
                        </PageTabPanel>
                    </div>
                ),
            },
            {
                name: "A column of tabs",
                readout: () => `selected: ${getColumnValue()}`,
                component: () => (
                    <div class={styles.columnDemo}>
                        <Tabs
                            getDir={() => "column"}
                            getAriaLabel={() => "Example sections"}
                            getTabs={() => COLUMN_TABS}
                            getSelectedValue={getColumnValue}
                            onSelectionChange={setColumnValue}
                            renderFloater={() => <PageTabFloater getDir={() => "column"} />}
                            renderTab={(getTab, getFlags) => (
                                <PageTabContent
                                    getFlags={getFlags}
                                    getDir={() => "column"}
                                    getIsSelected={() => getTab().value === getColumnValue()}
                                >
                                    {getTab().value}
                                </PageTabContent>
                            )}
                        />

                        <div class={styles.columnDemoPanel}>
                            <PageTabPanel
                                getId={() => getPanelId("column", getColumnValue())}
                                getTabId={() => getTabId("column", getColumnValue())}
                            >
                                {PANEL_BODIES[getColumnValue()]}
                            </PageTabPanel>
                        </div>
                    </div>
                ),
            },
            {
                name: "Tabs that are links",
                readout: () => `selected: ${getLinkValue()} — every tab carries an href, so each one is an anchor`,
                component: () => (
                    <Tabs
                        getDir={() => "row"}
                        getTabGap={() => ROW_TAB_GAP}
                        getAriaLabel={() => "Linked destinations"}
                        getTabs={() => LINK_TABS}
                        getSelectedValue={getLinkValue}
                        onSelectionChange={setLinkValue}
                        renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                        renderFloater={() => <PageTabFloater getDir={() => "row"} />}
                        renderTab={(getTab, getFlags) => (
                            <PageTabContent
                                getFlags={getFlags}
                                getDir={() => "row"}
                                getIsSelected={() => getTab().value === getLinkValue()}
                            >
                                {getTab().value}
                            </PageTabContent>
                        )}
                    />
                ),
            },
            {
                name: "Links through a component",
                readout: () =>
                    `selected: ${getCustomLinkValue()} — the same tabs rendered by a consumer's own link component`,
                component: () => (
                    <Tabs
                        getDir={() => "row"}
                        getTabGap={() => ROW_TAB_GAP}
                        getAriaLabel={() => "Routed destinations"}
                        getTabs={() => LINK_TABS}
                        getSelectedValue={getCustomLinkValue}
                        onSelectionChange={setCustomLinkValue}
                        linkComponent={PageTabLink}
                        renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                        renderFloater={() => <PageTabFloater getDir={() => "row"} />}
                        renderTab={(getTab, getFlags) => (
                            <PageTabContent
                                getFlags={getFlags}
                                getDir={() => "row"}
                                getIsSelected={() => getTab().value === getCustomLinkValue()}
                            >
                                {getTab().value}
                            </PageTabContent>
                        )}
                    />
                ),
            },
            {
                name: "Every tab disabled",
                readout: () => `selected: ${getDisabledValue()} — nothing can move it, so no tab holds the tab stop`,
                component: () => (
                    <Tabs
                        getDir={() => "row"}
                        getTabGap={() => ROW_TAB_GAP}
                        getAriaLabel={() => "Unavailable views"}
                        getTabs={() => DISABLED_TABS}
                        getSelectedValue={getDisabledValue}
                        onSelectionChange={setDisabledValue}
                        renderGutter={() => <PageTabGutter getDir={() => "row"} />}
                        renderFloater={() => <PageTabFloater getDir={() => "row"} />}
                        renderTab={(getTab, getFlags) => (
                            <PageTabContent
                                getFlags={getFlags}
                                getDir={() => "row"}
                                getIsSelected={() => getTab().value === getDisabledValue()}
                            >
                                {getTab().value}
                            </PageTabContent>
                        )}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
