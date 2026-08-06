import type { NavigationOrientation } from "./Navigation.types";

const DEFAULT_NAVIGATION_ORIENTATION: NavigationOrientation = "column";

const NEXT_KEYS: Record<NavigationOrientation, string[]> = {
    row: ["ArrowRight"],
    column: ["ArrowDown"],
    both: ["ArrowRight", "ArrowDown"],
};

const PREVIOUS_KEYS: Record<NavigationOrientation, string[]> = {
    row: ["ArrowLeft"],
    column: ["ArrowUp"],
    both: ["ArrowLeft", "ArrowUp"],
};

const FIRST_KEY = "Home";
const LAST_KEY = "End";

export namespace NavigationUtils {
    export const computeNextPosition = (
        key: string,
        from: number,
        length: number,
        opts?: { orientation?: NavigationOrientation; hasEdgeKeys?: boolean },
    ): number | undefined => {
        if (length < 1) return;

        const orientation = opts?.orientation ?? DEFAULT_NAVIGATION_ORIENTATION;

        const step = (delta: number) => (((from + delta) % length) + length) % length;

        if (NEXT_KEYS[orientation].includes(key)) return step(1);
        if (PREVIOUS_KEYS[orientation].includes(key)) return step(-1);

        if (opts?.hasEdgeKeys === false) return;

        if (key === FIRST_KEY) return 0;
        if (key === LAST_KEY) return length - 1;
    };
}
