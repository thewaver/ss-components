import type { ParentProps } from "solid-js";

import type { TabPanelProps } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import type { TabContentProps, TabDecorationProps } from "./TabContent.types";

import * as styles from "./TabContent.css";
import { TabPanel } from "../../../../Lib";

export const PageTabContent = (props: ParentProps<TabContentProps>) => (
    <div
        class={props.getDir() === "row" ? styles.rowTab : styles.columnTab}
        classList={{
            [styles.isSelected]: props.getIsSelected(),
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
    >
        {props.children}
    </div>
);

export const PageTabGutter = (props: TabDecorationProps) => (
    <div class={props.getDir() === "row" ? styles.rowTabGutter : undefined} data-gutter />
);

export const PageTabFloater = (props: TabDecorationProps) => (
    <div class={props.getDir() === "row" ? styles.rowTabFloater : styles.columnTabFloater} data-floater />
);

export const PageTabPanel = (props: TabPanelProps) => (
    <TabPanel getId={props.getId} getTabId={props.getTabId}>
        <div class={styles.tabPanel}>{props.children}</div>
    </TabPanel>
);
