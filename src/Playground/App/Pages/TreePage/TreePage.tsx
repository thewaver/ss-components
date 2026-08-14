import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Tree } from "../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeLinkProps, TreeNode } from "../../../../Lib/Fundamentals/Tree/Tree.types";
import { PageControlColumn } from "../../PageComponents/ControlRow/ControlRow";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import { PageTreeNodeContent } from "../../StyledComponents/TreeNodeContent/TreeNodeContent";

const OUTSIDE_COLLAPSE_DELAY_MS = 500;

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

const DOCS: TreeNode<string>[] = [
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

const ASSETS: TreeNode<Asset>[] = [
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

const PageTreeLink = (props: TreeLinkProps) => <a {...props} data-link-component />;

export const TreePage = () => {
    const defaultSignal = createSignal<string | undefined>();
    const defaultExpandedSignal = createSignal<string[]>(["src"]);

    const collapsedSignal = createSignal<string | undefined>();
    const collapsedExpandedSignal = createSignal<string[]>([]);

    const disabledSignal = createSignal<string | undefined>();
    const disabledExpandedSignal = createSignal<string[]>(["src", "Lib"]);

    const reachableSignal = createSignal<string | undefined>();
    const reachableExpandedSignal = createSignal<string[]>(["src"]);

    const outsideSignal = createSignal<string | undefined>();
    const outsideExpandedSignal = createSignal<string[]>(["src", "Lib"]);

    const linkSignal = createSignal<string | undefined>();
    const linkExpandedSignal = createSignal<string[]>(["Guides"]);

    const customLinkSignal = createSignal<string | undefined>();
    const customLinkExpandedSignal = createSignal<string[]>(["Guides"]);

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
                name: "Collapsed from outside",
                readout: () =>
                    `expanded: ${JSON.stringify(outsideExpandedSignal[0]())} — press the button, then focus a row inside Lib before the delay elapses; focus must land on Lib rather than on the page body`,
                component: () => (
                    <PageControlColumn>
                        <Tree
                            getNodes={() => FILES}
                            valueSignal={outsideSignal}
                            expandedSignal={outsideExpandedSignal}
                            getAriaLabel={() => "Repository, collapsed from outside"}
                            renderNode={(getNode, getFlags) => (
                                <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                            )}
                        />

                        <Button
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>
                                    {`Collapse Lib in ${OUTSIDE_COLLAPSE_DELAY_MS}ms`}
                                </PageButtonContent>
                            )}
                            onClick={async () => {
                                setTimeout(() => {
                                    outsideExpandedSignal[1]((prev) => prev.filter((value) => value !== "Lib"));
                                }, OUTSIDE_COLLAPSE_DELAY_MS);
                            }}
                        />
                    </PageControlColumn>
                ),
            },
            {
                name: "Nodes that are links",
                readout: () =>
                    `value: ${linkSignal[0]() ?? "undefined"} — every leaf carries an href, so each one is an anchor and the branches stay plain`,
                component: () => (
                    <Tree
                        getNodes={() => DOCS}
                        valueSignal={linkSignal}
                        expandedSignal={linkExpandedSignal}
                        getAriaLabel={() => "Documentation"}
                        renderNode={(getNode, getFlags) => (
                            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
                        )}
                    />
                ),
            },
            {
                name: "Links through a component",
                readout: () =>
                    `value: ${customLinkSignal[0]() ?? "undefined"} — the same nodes rendered by a consumer's own link component`,
                component: () => (
                    <Tree
                        getNodes={() => DOCS}
                        valueSignal={customLinkSignal}
                        expandedSignal={customLinkExpandedSignal}
                        getAriaLabel={() => "Routed documentation"}
                        linkComponent={PageTreeLink}
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
