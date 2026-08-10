import type { RichTextNode } from "./RichText.types";

export namespace RichTextUtils {
    const stringifyNode = (node: RichTextNode): string =>
        node.type === "text" ? node.content : `[${node.tag}]${node.children.map(stringifyNode).join("")}[/${node.tag}]`;

    export const parseContent = (input: string): RichTextNode[] => {
        const stack: { tag: string; children: RichTextNode[] }[] = [{ tag: "root", children: [] }];
        const tagRE = /\[\/?[a-z]+\]/gi;

        let lastIndex = 0;

        for (const match of input.matchAll(tagRE)) {
            const tagRaw = match[0];
            const index = match.index!;
            const isClosing = tagRaw.startsWith("[/");
            const tag = tagRaw.replace(/\[\/?|\]/g, "");

            // Push text before tag
            if (index > lastIndex) {
                stack[stack.length - 1].children.push({
                    type: "text",
                    content: input.slice(lastIndex, index),
                });
            }

            if (isClosing) {
                // Gracefully skip unmatched closing tag
                let found = false;

                for (let i = stack.length - 1; i >= 1; i--) {
                    if (stack[i].tag === tag) {
                        found = true;

                        const popped = stack.splice(i);
                        const completed = popped[0];

                        if (popped.length > 1) {
                            console.warn(
                                `RichText: closing [${tag}] discarded content from unclosed ` +
                                    `${popped
                                        .slice(1)
                                        .map((frame) => `[${frame.tag}]`)
                                        .join(", ")} in: ${input}`,
                            );
                        }

                        stack[stack.length - 1].children.push({ type: "tag", tag, children: completed.children });

                        break;
                    }
                }

                if (!found) {
                    // Treat unmatched closing tag as text
                    stack[stack.length - 1].children.push({ type: "text", content: tagRaw });
                }
            } else {
                stack.push({ tag, children: [] });
            }

            lastIndex = index + tagRaw.length;
        }

        // Push remaining text
        if (lastIndex < input.length) {
            stack[stack.length - 1].children.push({
                type: "text",
                content: input.slice(lastIndex),
            });
        }

        // Unwind unclosed tags — treat as literal
        while (stack.length > 1) {
            const unclosed = stack.pop()!;
            stack[stack.length - 1].children.push({
                type: "text",
                content: `[${unclosed.tag}]` + unclosed.children.map(stringifyNode).join(""),
            });
        }

        return stack[0].children;
    };
}
