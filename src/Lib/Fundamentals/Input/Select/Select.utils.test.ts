import { describe, expect, it } from "vitest";

import type { SelectItem } from "./Select.types";
import { SelectUtils } from "./Select.utils";

const OPTION_A = { value: "a", label: "A" };
const OPTION_B = { value: "b", label: "B" };
const OPTION_C = { value: "c", label: "C" };

const ITEMS: SelectItem<string>[] = [OPTION_A, { label: "Group", options: [OPTION_B, OPTION_C] }];

describe("getIsGroup", () => {
    it("tells a group from an option by whether it carries options", () => {
        expect(SelectUtils.getIsGroup(OPTION_A)).toBe(false);
        expect(SelectUtils.getIsGroup({ label: "Group", options: [] })).toBe(true);
    });
});

describe("getFlatOptions", () => {
    it("flattens one level of grouping while keeping the written order", () => {
        expect(SelectUtils.getFlatOptions(ITEMS)).toEqual([OPTION_A, OPTION_B, OPTION_C]);
    });

    it("keeps an ungrouped list as it is", () => {
        expect(SelectUtils.getFlatOptions([OPTION_A, OPTION_B])).toEqual([OPTION_A, OPTION_B]);
    });

    it("drops an empty group rather than leaving a hole in the walk", () => {
        expect(SelectUtils.getFlatOptions([OPTION_A, { label: "Empty", options: [] }, OPTION_B])).toEqual([
            OPTION_A,
            OPTION_B,
        ]);
    });

    it("returns nothing for no items", () => {
        expect(SelectUtils.getFlatOptions([])).toEqual([]);
    });
});
