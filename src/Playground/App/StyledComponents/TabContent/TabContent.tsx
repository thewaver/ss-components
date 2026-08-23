import type { ParentProps } from "solid-js";

import { TabPanel } from "../../../../Lib";
import type { TabPanelProps } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import { access } from "../../../../Lib/Utils/propUtils";
import type { TabContentProps, TabDecorationProps, TabFloaterProps } from "./TabContent.types";

import * as styles from "./TabContent.css";

export const PageTabContent = (props: ParentProps<TabContentProps>) => {
    return (
        <div
            class={access(props.dir) === "row" ? styles.rowTab : styles.columnTab}
            classList={{
                [styles.isSelected]: access(props.isSelected),
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
        >
            {props.children}
        </div>
    );
};

export const PageTabGutter = (props: TabDecorationProps) => {
    return <div class={access(props.dir) === "row" ? styles.rowTabGutter : undefined} data-gutter />;
};

export const PageTabFloater = (props: TabFloaterProps) => {
    return (
        <div
            class={access(props.dir) === "row" ? styles.rowTabFloater : styles.columnTabFloater}
            classList={{ [styles.isVisible]: access(props.visibilityTarget) === 1 }}
            style={{ "transition-duration": `${access(props.transitionDurationMs)}ms` }}
            data-floater
        />
    );
};

export const PageTabPanel = (props: TabPanelProps) => {
    return (
        <TabPanel id={props.id} tabId={props.tabId}>
            <div class={styles.tabPanel}>{props.children}</div>
        </TabPanel>
    );
};
