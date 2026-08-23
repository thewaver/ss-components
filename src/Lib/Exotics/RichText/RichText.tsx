import { createMemo } from "solid-js";
import type { JSX } from "solid-js";

import { access } from "../../Utils/propUtils";
import type { RichTextNode, RichTextProps } from "./RichText.types";
import { RichTextUtils } from "./RichText.utils";

import * as styles from "./RichText.css";

const DEFAULT_RICH_TEXT_CLASSES = {
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
            return RichTextUtils.parseContent(access(props.content));
        } catch (err) {
            console.error("RichText parse error:", err);
            return [{ type: "text", content: access(props.content) }] as RichTextNode[];
        }
    });

    return (
        <>
            {renderNodes(
                parsedTree(),
                props.computeClassNames?.(DEFAULT_RICH_TEXT_CLASSES) ?? DEFAULT_RICH_TEXT_CLASSES,
                access(props.removeOtherTags),
            )}
        </>
    );
};
