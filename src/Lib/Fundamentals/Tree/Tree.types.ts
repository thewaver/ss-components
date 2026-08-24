import type { Accessor, Component, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionTooltipDefs } from "../InteractionWrapper/InteractionWrapper.types";

export type TreeNodeFlags = {
    isBranch: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    depth: number;
};

export type TreeLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type TreeNode<T> = {
    value: T;
    href?: string;
    children?: TreeNode<T>[];
    isDisabled?: boolean;
    isReachableWhenDisabled?: boolean;
    tooltipDefs?: InteractionTooltipDefs<TreeNodeFlags>;
};

export type TreeRow<T> = {
    node: TreeNode<T>;
    index: number;
    depth: number;
    position: number;
    setSize: number;
    isExpanded: boolean;
    rows: TreeRow<T>[];
};

export type TreeNodeItemProps = AccessorProps<
    InteractionControlProps<TreeNodeFlags> & {
        level: number;
        position: number;
        setSize: number;
        href: string | undefined;
        linkComponent?: Component<TreeLinkProps>;
    }
> & {
    onActivate: () => void;
};

export type TreeProps<T> = AccessorProps<{
    ariaLabel?: string;
    linkComponent?: Component<TreeLinkProps>;
}> & {
    nodes: MaybeAccessor<TreeNode<T>[]>;
    valueSignal: Signal<T | undefined>;
    expandedSignal: Signal<T[]>;
    computeCustomText?: (node: TreeNode<T>) => string;
    computeEstimatedNodeHeight?: (index: number) => number;
    renderNode: (getNode: Accessor<TreeNode<T>>, getFlags: () => InteractionFlags<TreeNodeFlags>) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
