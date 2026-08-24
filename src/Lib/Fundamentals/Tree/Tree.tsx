import type { Accessor, JSX } from "solid-js";
import { For, Index, Show, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";
import { Dynamic } from "solid-js/web";

import { InteractionUtils } from "../../Abstracts/Interaction/Interaction.utils";
import { NavigationUtils } from "../../Abstracts/Navigation/Navigation.utils";
import { Typeahead } from "../../Abstracts/Typeahead/Typeahead";
import { TypeaheadUtils } from "../../Abstracts/Typeahead/Typeahead.utils";
import { Virtualizer } from "../../Abstracts/Virtualizer/Virtualizer";
import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { TreeNodeItemProps, TreeProps, TreeRow } from "./Tree.types";
import { TreeUtils } from "./Tree.utils";

import * as styles from "./Tree.css";

const EMPTY_PINNED_ROWS: number[] = [];

const EXPAND_SIBLINGS_KEY = "*";

const TreeNodeItem = (props: TreeNodeItemProps) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onActivate();
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.treeNode,
        "role": "treeitem",
        get "id"() {
            return access(props.id);
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
        get "aria-selected"() {
            return access(props.flags).isSelected;
        },
        get "aria-expanded"() {
            return access(props.flags).isBranch ? access(props.flags).isExpanded : undefined;
        },
        get "aria-level"() {
            return access(props.level);
        },
        get "aria-posinset"() {
            return access(props.position);
        },
        get "aria-setsize"() {
            return access(props.setSize);
        },
    };

    return (
        <Show
            when={access(props.href)}
            fallback={
                <div ref={(element) => props.ref?.(element)} {...commonProps} onClick={handleClick}>
                    {props.renderContent(() => access(props.flags))}
                </div>
            }
        >
            <Dynamic
                component={props.linkComponent ?? "a"}
                ref={(element: HTMLElement) => props.ref?.(element)}
                href={access(props.href)!}
                {...commonProps}
                onClick={handleClick}
            >
                {props.renderContent(() => access(props.flags))}
            </Dynamic>
        </Show>
    );
};

export const Tree = <T,>(props: TreeProps<T>) => {
    const treeId = createUniqueId();

    const [getFocusedValue, setFocusedValue] = createSignal<T | undefined>();

    const typeahead = Typeahead.createBuffer();

    const getRows = createMemo(() =>
        TreeUtils.getVisibleRows(access(props.nodes), (value) => props.expandedSignal[0]().includes(value)),
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

    const getIsVirtualized = createMemo(() => props.computeEstimatedNodeHeight !== undefined);

    const getRovingRow = createMemo(() => {
        const navigable = getNavigableRows();
        const focusedValue = getFocusedValue();

        const focusedRow = navigable.find((row) => row.node.value === focusedValue);

        if (focusedRow) return focusedRow;

        const selectedValue = props.valueSignal[0]();

        return navigable.find((row) => row.node.value === selectedValue) ?? navigable[0];
    });

    const [getSizerRef, setSizerRef] = createSignal<HTMLElement>();

    const rowWindow = Virtualizer.createRowWindow(getSizerRef, () => getFlatRows().length, {
        getIsEnabled: getIsVirtualized,
        computeEstimatedSize: (index) => props.computeEstimatedNodeHeight?.(index) ?? 0,
        getPinnedRows: () => {
            const roving = getRovingRow();

            return roving === undefined ? EMPTY_PINNED_ROWS : [roving.index];
        },
    });

    createEffect(() => {
        props.valueSignal[0]();

        setFocusedValue(() => undefined);
    });

    const getRowId = (row: TreeRow<T>) => `${treeId}-node-${row.index}`;

    const findRowById = (id: string | undefined) => getNavigableRows().find((row) => getRowId(row) === id);

    const computeRowText = (row: TreeRow<T>) =>
        props.computeCustomText?.(row.node) ?? TypeaheadUtils.getElementText(document.getElementById(getRowId(row)));

    let lastFocusedValue: T | undefined;
    let lastExpanded: T[] = [];

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

        if (rowWindow.getIsLive()) rowWindow.scrollToRow(row.index);

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

        if (e.key === EXPAND_SIBLINGS_KEY) {
            e.preventDefault();

            expandSiblings(current);

            return;
        }

        const query = typeahead.push(e);

        if (query !== undefined) {
            e.preventDefault();

            const position = TypeaheadUtils.computeNextIndex(
                query,
                navigable.indexOf(current),
                navigable.length,
                (index) => computeRowText(navigable[index]),
            );

            if (position !== undefined) focusRow(navigable[position]);

            return;
        }

        if (e.key === "Enter" || e.key === " ") {
            if (current.node.href) {
                if (e.key === "Enter") return;

                e.preventDefault();

                document.getElementById(getRowId(current))?.click();

                return;
            }

            e.preventDefault();

            activate(current);

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

    const renderRow = (getRow: Accessor<TreeRow<T>>): JSX.Element => (
        <InteractionWrapper
            sizing={"fill"}
            isDisabled={() => getRow().node.isDisabled ?? false}
            isReachableWhenDisabled={() => getRow().node.isReachableWhenDisabled ?? false}
            isTabbable={() => getRow().node.value === getRovingRow()?.node.value}
            tooltipDefs={() => getRow().node.tooltipDefs}
            extraFlags={() => ({
                isBranch: TreeUtils.getIsBranch(getRow().node),
                isExpanded: getRow().isExpanded,
                isSelected: getRow().node.value === props.valueSignal[0](),
                depth: getRow().depth,
            })}
            renderControl={(setElementRef, getFlags) => (
                <TreeNodeItem
                    ref={setElementRef}
                    id={() => getRowId(getRow())}
                    href={() => getRow().node.href}
                    level={() => getRow().depth + 1}
                    position={() => getRow().position + 1}
                    setSize={() => getRow().setSize}
                    flags={getFlags}
                    linkComponent={props.linkComponent}
                    renderContent={(getNodeFlags) => props.renderNode(() => getRow().node, getNodeFlags)}
                    onActivate={() => activate(getRow())}
                />
            )}
        />
    );

    const renderRows = (getLevelRows: Accessor<TreeRow<T>[]>): JSX.Element => (
        <Index each={getLevelRows()}>
            {(getRow) => (
                <>
                    {renderRow(getRow)}

                    <Show when={getRow().rows.length > 0}>
                        <div role="group">{renderRows(() => getRow().rows)}</div>
                    </Show>
                </>
            )}
        </Index>
    );

    const renderWindowedRows = () => (
        <div ref={setSizerRef} class={styles.treeSizer} style={{ height: `${rowWindow.getTotalSize()}px` }}>
            <For each={rowWindow.getRows()}>
                {(row) => (
                    <div
                        class={styles.treeSizerRow}
                        style={{ transform: `translateY(${rowWindow.getRowStart(row)}px)` }}
                        ref={(element) => rowWindow.measureRow(element, row.index)}
                    >
                        {renderRow(() => getFlatRows()[row.index])}
                    </div>
                )}
            </For>
        </div>
    );

    return (
        <div
            role="tree"
            aria-label={access(props.ariaLabel)}
            onKeyDown={handleKeyDown}
            onFocusIn={(e) => {
                lastFocusedValue = findRowById((e.target as HTMLElement).id)?.node.value;
            }}
        >
            <Show when={getIsVirtualized()} fallback={renderRows(getRows)}>
                {renderWindowedRows()}
            </Show>
        </div>
    );
};
