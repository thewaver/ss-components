import type { Accessor, Component, JSX } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { InteractionControlProps } from "../InteractionWrapper/InteractionWrapper.types";
import type { TabLinkProps } from "../Tabs/Tabs.types";

export type BreadcrumbsFlags = {
    isCurrent: boolean;
};

export type Breadcrumb<T> = {
    value: T;
    href?: string;
    isDisabled?: boolean;
    id?: string;
};

export type BreadcrumbsItemProps<T> = AccessorProps<
    Omit<InteractionControlProps<BreadcrumbsFlags>, "id"> & {
        linkComponent?: Component<TabLinkProps>;
    }
> & {
    crumb: MaybeAccessor<Breadcrumb<T>>;
    onSelect: (value: T) => void;
};

export type BreadcrumbsProps<T> = AccessorProps<{
    gap?: number;
    ariaLabel?: string;
    linkComponent?: Component<TabLinkProps>;
}> & {
    crumbs: MaybeAccessor<Breadcrumb<T>[]>;
    renderCrumb: (getCrumb: Accessor<Breadcrumb<T>>, getFlags: () => InteractionFlags<BreadcrumbsFlags>) => JSX.Element;
    renderSeparator?: () => JSX.Element;
    onSelect?: (value: T) => void;
};
