import type { TreeNode, TreeRow } from "./Tree.types";

const EMPTY_ROWS: never[] = [];

export namespace TreeUtils {
    export const getIsBranch = <T>(node: TreeNode<T>) => (node.children?.length ?? 0) > 0;

    export const getVisibleRows = <T>(nodes: TreeNode<T>[], computeIsExpanded: (value: T) => boolean): TreeRow<T>[] => {
        let index = 0;

        const build = (siblings: TreeNode<T>[], depth: number): TreeRow<T>[] =>
            siblings.map((node, position) => {
                const isExpanded = getIsBranch(node) && computeIsExpanded(node.value);
                const rowIndex = index++;

                return {
                    node,
                    index: rowIndex,
                    depth,
                    position,
                    setSize: siblings.length,
                    isExpanded,
                    rows: isExpanded ? build(node.children!, depth + 1) : EMPTY_ROWS,
                };
            });

        return build(nodes, 0);
    };

    export const getFlatRows = <T>(rows: TreeRow<T>[]): TreeRow<T>[] =>
        rows.flatMap((row) => [row, ...getFlatRows(row.rows)]);
}
