import type { Accessor, JSX } from "solid-js";
import { Index, Show, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { TreeNodeItemProps, TreeProps, TreeRow } from "./Tree.types";
import { TreeUtils } from "./Tree.utils";

import * as styles from "./Tree.css";

const EXPAND_SIBLINGS_KEY = "*";

const TreeNodeItem = (props: TreeNodeItemProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <div
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            class={styles.treeNode}
            role="treeitem"
            aria-disabled={getIsDisabled() || undefined}
            aria-selected={props.getFlags().isSelected}
            aria-expanded={props.getFlags().isBranch ? props.getFlags().isExpanded : undefined}
            aria-level={props.getLevel()}
            aria-posinset={props.getPosition()}
            aria-setsize={props.getSetSize()}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onActivate();
            }}
        >
            {props.renderContent(props.getFlags)}
        </div>
    );
};

export const Tree = <T,>(props: TreeProps<T>) => {
    const treeId = createUniqueId();

    const [getFocusedValue, setFocusedValue] = createSignal<T | undefined>();

    const getRows = createMemo(() =>
        TreeUtils.getVisibleRows(props.getNodes(), (value) => props.expandedSignal[0]().includes(value)),
    );

    const getFlatRows = createMemo(() => TreeUtils.getFlatRows(getRows()));

    const computeIsNavigable = (row: TreeRow<T>) => {
        const isReachable = InteractionUtils.computeIsReachable(
            row.node.isDisabled ?? false,
            row.node.isReachableWhenDisabled ?? false,
            row.node.tooltipDefs !== undefined,
        );

        return !row.node.isDisabled || isReachable;
    };

    const getNavigableRows = createMemo(() => getFlatRows().filter(computeIsNavigable));

    const getRovingRow = createMemo(() => {
        const navigable = getNavigableRows();
        const focusedValue = getFocusedValue();

        const focusedRow = navigable.find((row) => row.node.value === focusedValue);

        if (focusedRow) return focusedRow;

        const selectedValue = props.valueSignal[0]();

        return navigable.find((row) => row.node.value === selectedValue) ?? navigable[0];
    });

    createEffect(() => {
        props.valueSignal[0]();

        setFocusedValue(() => undefined);
    });

    const getRowId = (row: TreeRow<T>) => `${treeId}-node-${row.index}`;

    const findRowById = (id: string | undefined) => getNavigableRows().find((row) => getRowId(row) === id);

    let lastFocusedValue: T | undefined;
    let lastExpanded: T[] = [];

    /**
     * A row that unmounts while it holds focus leaves focus on the document body, which sends a keyboard
     * reader to the top of the page rather than to the node that has just closed. The tree's own routes into
     * `collapse` cannot produce that — `ArrowLeft` and a click both act on the branch, which is already the
     * focused element and stays mounted — so the only way in is a **consumer** writing `expandedSignal`
     * themselves, which never passes through `collapse` at all. Hence a guard over the visible rows rather
     * than one inside the collapsing function.
     *
     * All three conditions are load-bearing. Without a remembered row a tree nobody has touched would steal
     * focus the moment a consumer collapsed anything; without the row having left the visible set an
     * unrelated collapse elsewhere in the tree would do the same; and without focus actually sitting on the
     * body this would fight whatever the consumer moved focus to on purpose.
     */
    createEffect(() => {
        const expanded = props.expandedSignal[0]();
        const collapsed = lastExpanded.filter((value) => !expanded.includes(value));
        const visible = getFlatRows();

        lastExpanded = expanded;

        if (collapsed.length < 1) return;
        if (lastFocusedValue === undefined) return;
        if (document.activeElement !== document.body) return;
        if (visible.some((row) => row.node.value === lastFocusedValue)) return;

        const branch = visible.find((row) => collapsed.includes(row.node.value));

        if (branch) focusRow(branch);
    });

    const focusRow = (row: TreeRow<T>) => {
        setFocusedValue(() => row.node.value);

        document.getElementById(getRowId(row))?.focus();
    };

    const findParentRow = (row: TreeRow<T>) => {
        const flat = getFlatRows();

        for (let index = row.index - 1; index >= 0; index--) {
            if (flat[index].depth < row.depth) return flat[index];
        }
    };

    const expand = (row: TreeRow<T>) => {
        if (row.node.isDisabled) return;

        props.expandedSignal[1]((prev) => (prev.includes(row.node.value) ? prev : [...prev, row.node.value]));
    };

    const collapse = (row: TreeRow<T>) => {
        if (row.node.isDisabled) return;

        props.expandedSignal[1]((prev) => prev.filter((value) => value !== row.node.value));
    };

    const toggle = (row: TreeRow<T>) => {
        if (row.isExpanded) {
            collapse(row);

            return;
        }

        expand(row);
    };

    const expandSiblings = (row: TreeRow<T>) => {
        const parent = findParentRow(row);
        const siblings = parent ? parent.rows : getRows();

        props.expandedSignal[1]((prev) => [
            ...prev,
            ...siblings
                .filter(
                    (sibling) =>
                        TreeUtils.getIsBranch(sibling.node) &&
                        !sibling.node.isDisabled &&
                        !prev.includes(sibling.node.value),
                )
                .map((sibling) => sibling.node.value),
        ]);
    };

    const select = (value: T) => {
        if (value === props.valueSignal[0]()) return;

        props.valueSignal[1](() => value);

        void props.onSelectionChange?.(value);
    };

    const activate = (row: TreeRow<T>) => {
        if (row.node.isDisabled) return;

        select(row.node.value);

        if (TreeUtils.getIsBranch(row.node)) toggle(row);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const navigable = getNavigableRows();

        if (navigable.length < 1) return;

        const current = findRowById(document.activeElement?.id) ?? getRovingRow();

        if (!current) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();

            activate(current);

            return;
        }

        if (e.key === EXPAND_SIBLINGS_KEY) {
            e.preventDefault();

            expandSiblings(current);

            return;
        }

        if (e.key === "ArrowRight") {
            if (!TreeUtils.getIsBranch(current.node)) return;

            e.preventDefault();

            if (!current.isExpanded) {
                expand(current);

                return;
            }

            const child = TreeUtils.getFlatRows(current.rows).find(computeIsNavigable);

            if (child) focusRow(child);

            return;
        }

        if (e.key === "ArrowLeft") {
            if (TreeUtils.getIsBranch(current.node) && current.isExpanded) {
                e.preventDefault();

                collapse(current);

                return;
            }

            const parent = findParentRow(current);

            if (!parent || !computeIsNavigable(parent)) return;

            e.preventDefault();

            focusRow(parent);

            return;
        }

        const position = NavigationUtils.computeNextPosition(e.key, navigable.indexOf(current), navigable.length);

        if (position === undefined) return;

        e.preventDefault();

        focusRow(navigable[position]);
    };

    /**
     * The rows are rendered from the nesting while everything else works off the flat order, which is the
     * arrangement `Select` already uses for its groups. The `role="group"` box is a sibling of the branch's
     * own row rather than its child: `InteractionWrapper` listens for hover and press on the element it was
     * handed, and a row nested inside another row would report its ancestor as hovered and pressed too. Each
     * level of grouping still nests, so the depth a reader is told is the depth the markup shows.
     */
    const renderRows = (getLevelRows: Accessor<TreeRow<T>[]>): JSX.Element => (
        <Index each={getLevelRows()}>
            {(getRow) => (
                <>
                    <InteractionWrapper
                        getSizing={() => "fill"}
                        getIsDisabled={() => getRow().node.isDisabled ?? false}
                        getIsReachableWhenDisabled={() => getRow().node.isReachableWhenDisabled ?? false}
                        getIsTabbable={() => getRow().node.value === getRovingRow()?.node.value}
                        getTooltipDefs={() => getRow().node.tooltipDefs}
                        getExtraFlags={() => ({
                            isBranch: TreeUtils.getIsBranch(getRow().node),
                            isExpanded: getRow().isExpanded,
                            isSelected: getRow().node.value === props.valueSignal[0](),
                            depth: getRow().depth,
                        })}
                        renderControl={(setElementRef, getFlags) => (
                            <TreeNodeItem
                                ref={setElementRef}
                                getId={() => getRowId(getRow())}
                                getLevel={() => getRow().depth + 1}
                                getPosition={() => getRow().position + 1}
                                getSetSize={() => getRow().setSize}
                                getFlags={getFlags}
                                renderContent={(getNodeFlags) => props.renderNode(() => getRow().node, getNodeFlags)}
                                onActivate={() => activate(getRow())}
                            />
                        )}
                    />

                    <Show when={getRow().rows.length > 0}>
                        <div role="group">{renderRows(() => getRow().rows)}</div>
                    </Show>
                </>
            )}
        </Index>
    );

    return (
        <div
            role="tree"
            aria-label={props.getAriaLabel?.()}
            onKeyDown={handleKeyDown}
            onFocusIn={(e) => {
                lastFocusedValue = findRowById((e.target as HTMLElement).id)?.node.value;
            }}
        >
            {renderRows(getRows)}
        </div>
    );
};
