import { describe, expect, it } from "vitest";

import { TypeaheadUtils } from "./Typeahead.utils";

const CITIES = ["London", "Lisbon", "Los Angeles", "Madrid", "Manchester"];

const computeText = (index: number) => CITIES[index];

const key = (value: string, modifiers?: Partial<KeyboardEvent>) => ({ key: value, ...modifiers }) as KeyboardEvent;

describe("TypeaheadUtils.getIsQueryKey", () => {
    it("takes a single printable character", () => {
        expect(TypeaheadUtils.getIsQueryKey(key("a"), false)).toBe(true);
        expect(TypeaheadUtils.getIsQueryKey(key("7"), false)).toBe(true);
        expect(TypeaheadUtils.getIsQueryKey(key("é"), false)).toBe(true);
    });

    it("leaves the named keys alone, so activation and the walk still work", () => {
        expect(TypeaheadUtils.getIsQueryKey(key("Enter"), true)).toBe(false);
        expect(TypeaheadUtils.getIsQueryKey(key("ArrowDown"), true)).toBe(false);
        expect(TypeaheadUtils.getIsQueryKey(key("Escape"), true)).toBe(false);
    });

    it("leaves a shortcut alone", () => {
        expect(TypeaheadUtils.getIsQueryKey(key("a", { ctrlKey: true }), false)).toBe(false);
        expect(TypeaheadUtils.getIsQueryKey(key("a", { metaKey: true }), false)).toBe(false);
    });

    /**
     * Space activates an item in a menu and selects one in a list, so it can only join the query once there
     * is a query for it to join — which is exactly when a two-word name is being typed.
     */
    it("takes a space only while something is already being typed", () => {
        expect(TypeaheadUtils.getIsQueryKey(key(" "), false)).toBe(false);
        expect(TypeaheadUtils.getIsQueryKey(key(" "), true)).toBe(true);
    });
});

describe("TypeaheadUtils.computeNextIndex", () => {
    it("finds the next item starting with the query, wrapping past the end", () => {
        expect(TypeaheadUtils.computeNextIndex("m", 0, CITIES.length, computeText)).toBe(3);
        expect(TypeaheadUtils.computeNextIndex("l", 3, CITIES.length, computeText)).toBe(0);
    });

    it("matches without regard to case", () => {
        expect(TypeaheadUtils.computeNextIndex("LIS", 0, CITIES.length, computeText)).toBe(1);
    });

    /**
     * A growing query keeps the item it is already on when that item still matches — otherwise typing "l",
     * "i", "s" would walk away from Lisbon on the second keystroke and never come back.
     */
    it("holds the current item while a longer query still matches it", () => {
        expect(TypeaheadUtils.computeNextIndex("li", 1, CITIES.length, computeText)).toBe(1);
    });

    /**
     * The same character pressed again means "the next one of these", which is the only way to reach the
     * second and third item sharing a first letter.
     */
    it("cycles through the items sharing a letter when that letter is repeated", () => {
        expect(TypeaheadUtils.computeNextIndex("l", 0, CITIES.length, computeText)).toBe(1);
        expect(TypeaheadUtils.computeNextIndex("ll", 1, CITIES.length, computeText)).toBe(2);
        expect(TypeaheadUtils.computeNextIndex("lll", 2, CITIES.length, computeText)).toBe(0);
    });

    it("reports nothing when no item matches, so the caller leaves the highlight alone", () => {
        expect(TypeaheadUtils.computeNextIndex("z", 0, CITIES.length, computeText)).toBeUndefined();
        expect(TypeaheadUtils.computeNextIndex("lo", 0, 0, computeText)).toBeUndefined();
        expect(TypeaheadUtils.computeNextIndex("", 0, CITIES.length, computeText)).toBeUndefined();
    });

    it("starts from the beginning when nothing is highlighted yet", () => {
        expect(TypeaheadUtils.computeNextIndex("ma", -1, CITIES.length, computeText)).toBe(3);
    });
});
