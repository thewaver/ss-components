import { describe, expect, it } from "vitest";

import type { TreeNode } from "./Tree.types";
import { TreeUtils } from "./Tree.utils";

const LEAF: TreeNode<string> = { value: "leaf" };

const NODES: TreeNode<string>[] = [
    {
        value: "src",
        children: [{ value: "index.ts" }, { value: "Lib", children: [{ value: "Tree.tsx" }] }],
    },
    { value: "package.json" },
];

const expandAll = () => true;

const expandNone = () => false;

const valuesOf = (nodes: TreeNode<string>[], computeIsExpanded: (value: string) => boolean) =>
    TreeUtils.getFlatRows(TreeUtils.getVisibleRows(nodes, computeIsExpanded)).map((row) => row.node.value);

describe("getIsBranch", () => {
    it("tells a branch from a leaf by whether it carries children", () => {
        expect(TreeUtils.getIsBranch(LEAF)).toBe(false);
        expect(TreeUtils.getIsBranch({ value: "src", children: [LEAF] })).toBe(true);
    });

    it("counts a branch with an empty list as a leaf, so nothing offers to open an empty box", () => {
        expect(TreeUtils.getIsBranch({ value: "src", children: [] })).toBe(false);
    });
});

describe("getVisibleRows", () => {
    it("leaves a collapsed branch's children out of the walk entirely", () => {
        expect(valuesOf(NODES, expandNone)).toEqual(["src", "package.json"]);
    });

    it("walks an expanded tree depth first, which is the order it is read in", () => {
        expect(valuesOf(NODES, expandAll)).toEqual(["src", "index.ts", "Lib", "Tree.tsx", "package.json"]);
    });

    it("opens only the branches asked for", () => {
        expect(valuesOf(NODES, (value) => value === "src")).toEqual(["src", "index.ts", "Lib", "package.json"]);
    });

    it("numbers each row by where it sits in the flat walk rather than among its siblings", () => {
        const flat = TreeUtils.getFlatRows(TreeUtils.getVisibleRows(NODES, expandAll));

        expect(flat.map((row) => row.index)).toEqual([0, 1, 2, 3, 4]);
        expect(flat.map((row) => row.depth)).toEqual([0, 1, 1, 2, 0]);
        expect(flat.map((row) => row.position)).toEqual([0, 0, 1, 0, 1]);
        expect(flat.map((row) => row.setSize)).toEqual([2, 2, 2, 1, 2]);
    });

    it("reports a leaf as collapsed however the expanded list is written", () => {
        expect(TreeUtils.getVisibleRows([LEAF], expandAll)[0].isExpanded).toBe(false);
    });

    it("returns nothing for no nodes", () => {
        expect(TreeUtils.getVisibleRows([], expandAll)).toEqual([]);
    });
});
