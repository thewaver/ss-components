import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { access } from "./propUtils";

describe("access", () => {
    it("returns a plain value unchanged", () => {
        expect(access(5)).toBe(5);
    });

    it("calls an accessor and returns its value", () => {
        expect(access(() => 5)).toBe(5);
    });

    it("returns undefined for a prop the caller never supplied", () => {
        expect(access(undefined)).toBeUndefined();
    });

    it("reads through on every call, so a plain value the caller derived from a signal still tracks", () => {
        createRoot((dispose) => {
            const [getCount, setCount] = createSignal(1);
            const props = {
                get count() {
                    return getCount();
                },
            };

            expect(access(props.count)).toBe(1);

            setCount(2);

            expect(access(props.count)).toBe(2);

            dispose();
        });
    });
});
