import { afterEach, describe, expect, it, vi } from "vitest";

import { RichTextUtils } from "./RichText.utils";

const text = (content: string) => ({ type: "text", content });

afterEach(() => {
    vi.restoreAllMocks();
});

describe("parseContent", () => {
    it("returns plain text as a single node", () => {
        expect(RichTextUtils.parseContent("hello")).toEqual([text("hello")]);
    });

    it("returns nothing for an empty string", () => {
        expect(RichTextUtils.parseContent("")).toEqual([]);
    });

    it("wraps tagged content in a tag node", () => {
        expect(RichTextUtils.parseContent("[b]bold[/b]")).toEqual([
            { type: "tag", tag: "b", children: [text("bold")] },
        ]);
    });

    it("keeps the text either side of a tag", () => {
        expect(RichTextUtils.parseContent("before [b]bold[/b] after")).toEqual([
            text("before "),
            { type: "tag", tag: "b", children: [text("bold")] },
            text(" after"),
        ]);
    });

    it("nests tags inside one another", () => {
        expect(RichTextUtils.parseContent("[b]a[i]b[/i]c[/b]")).toEqual([
            {
                type: "tag",
                tag: "b",
                children: [text("a"), { type: "tag", tag: "i", children: [text("b")] }, text("c")],
            },
        ]);
    });

    it("treats an unmatched closing tag as literal text rather than dropping it", () => {
        expect(RichTextUtils.parseContent("a[/b]c")).toEqual([text("a"), text("[/b]"), text("c")]);
    });

    it("unwinds an unclosed tag back into the text it was written as", () => {
        expect(RichTextUtils.parseContent("x[b]y")).toEqual([text("x"), text("[b]y")]);
    });

    it("unwinds nested unclosed tags in the order they were opened", () => {
        expect(RichTextUtils.parseContent("[b]a[i]b")).toEqual([text("[b]a[i]b")]);
    });

    it("matches tags case-sensitively despite finding them case-insensitively", () => {
        expect(RichTextUtils.parseContent("[B]x[/b]")).toEqual([text("[B]x[/b]")]);
    });

    it("warns and discards when a closing tag skips past an unclosed one", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const result = RichTextUtils.parseContent("[b][i]x[/b]");

        expect(result).toEqual([{ type: "tag", tag: "b", children: [] }]);
        expect(warn, "the discarded content is announced rather than silently lost").toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain("[i]");
    });

    it("leaves a bracketed word that is not a tag alone", () => {
        expect(RichTextUtils.parseContent("[123] and [b-c]")).toEqual([text("[123] and [b-c]")]);
    });
});
