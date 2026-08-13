import { createMemo, createSignal } from "solid-js";

import { Tree } from "../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeNode } from "../../../../Lib/Fundamentals/Tree/Tree.types";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import { PageTreeNodeContent } from "../../StyledComponents/TreeNodeContent/TreeNodeContent";

type Asset = {
    name: string;
    kind: string;
};

const FILES: TreeNode<string>[] = [
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

const FILES_WITH_DISABLED: TreeNode<string>[] = [
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

const FILES_WITH_REACHABLE: TreeNode<string>[] = [
    {
        value: "src",
        children: [
            { value: "index.ts" },
            {
                value: "node_modules",
                isDisabled: true,
                isReachableWhenDisabled: true,
                tooltipDefs: {
                    getPlacement: () => ({ x: "right-out", y: "center" }),
                    getOffset: () => ({ x: 10, y: 0 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <PageTooltipContent
                            getVisibilityTarget={getVisibilityTarget}
                            getTransitionDurationMs={getTransitionDurationMs}
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

const ASSETS: TreeNode<Asset>[] = [
    {
        value: { name: "Sprites", kind: "folder" },
        children: [
            { value: { name: "knight.png", kind: "image" } },
            { value: { name: "knight_profile.webp", kind: "image" } },
        ],
    },
    {
        value: { name: "Audio", kind: "folder" },
        children: [{ value: { name: "theme.ogg", kind: "track" } }],
    },
    { value: { name: "credits.txt", kind: "text" } },
];

export const TreePage = () => {
    const defaultSignal = createSignal<string | undefined>();
    const defaultExpandedSignal = createSignal<string[]>(["src"]);

    const collapsedSignal = createSignal<string | undefined>();
    const collapsedExpandedSignal = createSignal<string[]>([]);

    const disabledSignal = createSignal<string | undefined>();
    const disabledExpandedSignal = createSignal<string[]>(["src", "Lib"]);

    const reachableSignal = createSignal<string | undefined>();
    const reachableExpandedSignal = createSignal<string[]>(["src"]);

    const recordSignal = createSignal<Asset | undefined>();
    const recordExpandedSignal = createSignal<Asset[]>([]);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () =>
                    `value: ${defaultSignal[0]() ?? "undefined"} | expanded: ${JSON.stringify(defaultExpandedSignal[0]())} — right opens a branch, left closes it or climbs to the parent`,
                component: () => (
                    <Tree
                        getNodes={() => FILES}
                        valueSignal={defaultSignal}
                        expandedSignal={defaultExpandedSignal}
                        getAriaLabel={() => "Repository"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                        )}
                    />
                ),
            },
            {
                name: "Everything collapsed",
                readout: () =>
                    `value: ${collapsedSignal[0]() ?? "undefined"} | expanded: ${JSON.stringify(collapsedExpandedSignal[0]())} — asterisk opens every branch at the level focus is on`,
                component: () => (
                    <Tree
                        getNodes={() => FILES}
                        valueSignal={collapsedSignal}
                        expandedSignal={collapsedExpandedSignal}
                        getAriaLabel={() => "Repository"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                        )}
                    />
                ),
            },
            {
                name: "Disabled nodes",
                readout: () =>
                    `value: ${disabledSignal[0]() ?? "undefined"} — arrows skip index.ts and Lib, while what is inside Lib stays reachable`,
                component: () => (
                    <Tree
                        getNodes={() => FILES_WITH_DISABLED}
                        valueSignal={disabledSignal}
                        expandedSignal={disabledExpandedSignal}
                        getAriaLabel={() => "Repository"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                        )}
                    />
                ),
            },
            {
                name: "Disabled nodes + reachable",
                readout: () =>
                    `value: ${reachableSignal[0]() ?? "undefined"} — arrows stop on node_modules, hover explains why, and nothing opens it`,
                component: () => (
                    <Tree
                        getNodes={() => FILES_WITH_REACHABLE}
                        valueSignal={reachableSignal}
                        expandedSignal={reachableExpandedSignal}
                        getAriaLabel={() => "Repository"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                        )}
                    />
                ),
            },
            {
                name: "Record values",
                readout: () =>
                    `value: ${recordSignal[0]()?.name ?? "undefined"} | expanded: ${recordExpandedSignal[0]().length} branch(es) — the value is the record itself, not a name`,
                component: () => (
                    <Tree
                        getNodes={() => ASSETS}
                        valueSignal={recordSignal}
                        expandedSignal={recordExpandedSignal}
                        getAriaLabel={() => "Assets"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags} getDetail={() => getNode().value.kind}>
                                {getNode().value.name}
                            </PageTreeNodeContent>
                        )}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
