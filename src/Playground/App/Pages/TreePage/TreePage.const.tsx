import type { TreeNode } from "../../../../Lib/Fundamentals/Tree/Tree.types";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import type { Asset } from "./TreePage.types";

export const OUTSIDE_COLLAPSE_DELAY_MS = 500;

export const FILES: TreeNode<string>[] = [
    {
        value: "src",
        children: [
            { value: "index.ts" },
            {
                value: "Lib",
                children: [
                    { value: "Tree.tsx" },
                    { value: "Tree.utils.ts" },
                    { value: "Input", children: [{ value: "Select.tsx" }, { value: "TextInput.tsx" }] },
                ],
            },
            { value: "Playground", children: [{ value: "App.tsx" }] },
        ],
    },
    { value: "package.json" },
    { value: "README.md" },
];

export const FILES_WITH_DISABLED: TreeNode<string>[] = [
    {
        value: "src",
        children: [
            { value: "index.ts", isDisabled: true },
            {
                value: "Lib",
                isDisabled: true,
                children: [{ value: "Tree.tsx" }, { value: "Tree.utils.ts" }],
            },
            { value: "Playground", children: [{ value: "App.tsx" }] },
        ],
    },
    { value: "package.json" },
];

export const FILES_WITH_REACHABLE: TreeNode<string>[] = [
    {
        value: "src",
        children: [
            { value: "index.ts" },
            {
                value: "node_modules",
                isDisabled: true,
                isReachableWhenDisabled: true,
                tooltipDefs: {
                    placement: () => ({ x: "right-out", y: "center" }),
                    offset: () => ({ x: 10, y: 0 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <PageTooltipContent
                            visibilityTarget={getVisibilityTarget}
                            transitionDurationMs={getTransitionDurationMs}
                        >
                            Not indexed, so this one cannot be opened.
                        </PageTooltipContent>
                    ),
                },
                children: [{ value: "solid-js" }],
            },
            { value: "Playground", children: [{ value: "App.tsx" }] },
        ],
    },
    { value: "package.json" },
];

export const DOCS: TreeNode<string>[] = [
    {
        value: "Guides",
        children: [
            { value: "Installing", href: "#tree-installing" },
            { value: "Theming", href: "#tree-theming" },
        ],
    },
    {
        value: "Reference",
        children: [{ value: "Props", href: "#tree-props" }],
    },
    { value: "Changelog", href: "#tree-changelog" },
];

export const ASSETS: TreeNode<Asset>[] = [
    {
        value: { name: "Sprites", kind: "folder" },
        children: [
            { value: { name: "knight.webp", kind: "image" } },
            { value: { name: "knightette.webp", kind: "image" } },
        ],
    },
    {
        value: { name: "Audio", kind: "folder" },
        children: [{ value: { name: "theme.ogg", kind: "track" } }],
    },
    { value: { name: "credits.txt", kind: "text" } },
];
