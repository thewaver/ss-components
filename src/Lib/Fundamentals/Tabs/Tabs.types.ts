import type { Accessor, Component, JSX, ParentProps } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps } from "../InteractionWrapper/InteractionWrapper.types";

export type TabsDir = "column" | "row";

export type TabLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type Tab<T> = {
    value: T;
    href?: string;
    isDisabled?: boolean;
    id?: string;
    panelId?: string;
};

export type TabPanelProps = ParentProps<
    AccessorProps<{
        id: string;
        tabId: string;
    }>
>;

export type TabsItemProps<T> = AccessorProps<
    Omit<InteractionControlProps, "id"> & {
        isSelected: boolean;
        linkComponent?: Component<TabLinkProps>;
    }
> & {
    getTab: Accessor<Tab<T>>;
    onSelect: (value: T) => void;
};

export type TabsProps<T> = AccessorProps<{
    dir?: TabsDir;
    tabGap?: number;
    transitionDurationMs?: number;
    ariaLabel?: string;
    linkComponent?: Component<TabLinkProps>;
    renderGutter?: () => JSX.Element;
    renderFloater?: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}> & {
    getTabs: Accessor<Tab<T>[]>;
    getSelectedValue: Accessor<T | undefined>;
    renderTab: (getTab: Accessor<Tab<T>>, getFlags: () => InteractionFlags) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
