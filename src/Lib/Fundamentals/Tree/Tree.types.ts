import type { Accessor, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionTooltipDefs } from "../InteractionWrapper/InteractionWrapper.types";

export type TreeNodeFlags = {
    isBranch: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    depth: number;
};

export type TreeNode<T> = {
    value: T;
    children?: TreeNode<T>[];
    isDisabled?: boolean;
    isReachableWhenDisabled?: boolean;
    tooltipDefs?: InteractionTooltipDefs<TreeNodeFlags>;
};

/**
 * What is on screen once the collapsed branches are taken out: `rows` are the visible children, so the
 * record is a rendering tree, while `index` is the position of the same row in the flat walking order.
 * `depth` and `position` are zero-based; `aria-level` and `aria-posinset` are one-based, so the two are
 * not interchangeable.
 */
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
    }
> & {
    onActivate: () => void;
};

export type TreeProps<T> = AccessorProps<{
    ariaLabel?: string;
}> & {
    getNodes: Accessor<TreeNode<T>[]>;
    valueSignal: Signal<T | undefined>;
    expandedSignal: Signal<T[]>;
    renderNode: (getNode: Accessor<TreeNode<T>>, getFlags: () => InteractionFlags<TreeNodeFlags>) => JSX.Element;
    onSelectionChange?: (value: T) => void;
};
