import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";

export const ROW_TAB_GAP = 10;

export const getTabId = (prefix: string, value: string) => `${prefix}-tab-${value.toLocaleLowerCase()}`;

export const getPanelId = (prefix: string, value: string) => `${prefix}-panel-${value.toLocaleLowerCase()}`;

const withIds = (prefix: string, tabs: Tab<string>[]): Tab<string>[] =>
    tabs.map((tab) => ({
        ...tab,
        id: getTabId(prefix, tab.value),
        panelId: getPanelId(prefix, tab.value),
    }));

export const ROW_TABS = withIds("row", [
    { value: "Render" },
    { value: "Source" },
    { value: "Metrics", isDisabled: true },
    { value: "Export" },
]);

export const COLUMN_TABS = withIds("column", [
    { value: "Overview" },
    { value: "Details" },
    { value: "History", isDisabled: true },
    { value: "Settings" },
]);

export const LINK_TABS: Tab<string>[] = [
    { value: "Docs", href: "#tabs-docs" },
    { value: "Guides", href: "#tabs-guides" },
    { value: "Blog", href: "#tabs-blog" },
];

export const CLEARABLE_TABS: Tab<string>[] = [{ value: "One" }, { value: "Two" }, { value: "Three" }];

export const DISABLED_TABS: Tab<string>[] = [
    { value: "Draft", isDisabled: true },
    { value: "Review", isDisabled: true },
    { value: "Publish", isDisabled: true },
];

export const PANEL_BODIES: Record<string, string> = {
    Render: "The component itself, drawn with whatever the props panel currently says.",
    Source: "The code behind it, which is a second panel over the same tab list.",
    Metrics: "Disabled, so the keyboard walks past it and a click does nothing.",
    Export: "A copy of the source, ready to paste elsewhere.",
    Overview: "What the section is for, in one paragraph.",
    Details: "The long version, which is why this list is a column rather than a row.",
    History: "Disabled, so nothing reaches this panel.",
    Settings: "The knobs, which nobody reads until something goes wrong.",
};
