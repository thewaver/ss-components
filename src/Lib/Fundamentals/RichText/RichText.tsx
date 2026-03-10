import { JSX, createMemo } from "solid-js";

import { RichTextNode, RichTextProps } from "./RichText.types";
import { RichTextUtils } from "./RichText.utils";

import * as styles from "./RichText.css";

export const DEFAULT_RICH_TEXT_CLASSES = {
    b: styles.boldText,
    i: styles.italicText,
    s: styles.strikedText,
    u: styles.underlineText,
    li: styles.listItem,
} as const;

const renderNodes = (
    nodes: RichTextNode[],
    classMap: Record<string, string>,
    removeUnknownTags?: boolean,
): JSX.Element[] => {
    return nodes.map((node) => {
        if (node.type === "text") {
            return <>{node.content}</>;
        }

        const className = classMap[node.tag];

        if (className) {
            return <span class={className}>{renderNodes(node.children, classMap, removeUnknownTags)}</span>;
        }

        if (removeUnknownTags) {
            return <>{renderNodes(node.children, classMap, removeUnknownTags)}</>;
        }

        return (
            <>
                <span>{`[${node.tag}]`}</span>
                {renderNodes(node.children, classMap, removeUnknownTags)}
                <span>{`[/${node.tag}]`}</span>
            </>
        );
    });
};

export const RichText = (props: RichTextProps) => {
    const parsedTree = createMemo(() => {
        try {
            return RichTextUtils.parseContent(props.getContent());
        } catch (err) {
            console.error("RichText parse error:", err);
            return [{ type: "text", content: props.getContent() }] as RichTextNode[];
        }
    });

    return (
        <>
            {renderNodes(
                parsedTree(),
                props.getClassNames?.() ?? DEFAULT_RICH_TEXT_CLASSES,
                props.getRemoveOtherTags?.(),
            )}
        </>
    );
};
