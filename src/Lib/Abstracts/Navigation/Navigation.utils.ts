import type { NavigationCell, NavigationGrid, NavigationOrientation } from "./Navigation.types";

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

    export const computeNextCell = (
        key: string,
        from: NavigationCell,
        grid: NavigationGrid,
        opts?: { pageRows?: number; hasEdgeKeys?: boolean; hasPageKeys?: boolean },
    ): NavigationCell | undefined => {
        if (grid.width < 1 || grid.height < 1) return;

        const carry = (dx: number, dy: number) => {
            const flat = (from.y + dy) * grid.width + from.x + dx;

            return {
                x: ((flat % grid.width) + grid.width) % grid.width,
                y: Math.floor(flat / grid.width),
            };
        };

        if (key === "ArrowRight") return carry(1, 0);
        if (key === "ArrowLeft") return carry(-1, 0);
        if (key === "ArrowDown") return carry(0, 1);
        if (key === "ArrowUp") return carry(0, -1);

        if (opts?.hasPageKeys !== false) {
            const pageRows = opts?.pageRows ?? grid.height;

            if (key === "PageUp") return { x: from.x, y: from.y - pageRows };
            if (key === "PageDown") return { x: from.x, y: from.y + pageRows };
        }

        if (opts?.hasEdgeKeys === false) return;

        if (key === FIRST_KEY) return { x: 0, y: from.y };
        if (key === LAST_KEY) return { x: grid.width - 1, y: from.y };
    };
}
