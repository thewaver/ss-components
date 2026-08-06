import type { Accessor, Component, JSX } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps } from "../InteractionWrapper/InteractionWrapper.types";

export type TabsDir = "column" | "row";

export type TabLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type Tab<T> = {
    value: T;
    href?: string;
    isDisabled?: boolean;
};

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
    linkComponent?: Component<TabLinkProps>;
    renderGutter?: () => JSX.Element;
    renderFloater?: () => JSX.Element;
}> & {
    getTabs: Accessor<Tab<T>[]>;
    getSelectedValue: Accessor<T | undefined>;
    renderTab: (getTab: Accessor<Tab<T>>, getFlags: () => InteractionFlags) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
