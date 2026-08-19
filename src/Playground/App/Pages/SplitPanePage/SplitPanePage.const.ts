import type { SplitPaneEntry } from "../../../../Lib/Fundamentals/SplitPane/SplitPane.types";

export const PAIR: SplitPaneEntry[] = [
    { id: "split-pair-start", gutterAriaLabel: "Resize navigation" },
    { id: "split-pair-end" },
];

export const BOUNDED: SplitPaneEntry[] = [
    { id: "split-bounded-start", minPx: 120, maxPx: 220, gutterAriaLabel: "Resize sidebar" },
    { id: "split-bounded-end", minPx: 160 },
];

export const CRAMPED: SplitPaneEntry[] = [
    { id: "split-cramped-start", minPx: 250, gutterAriaLabel: "Resize left" },
    { id: "split-cramped-end", minPx: 400 },
];

export const TRIPLE: SplitPaneEntry[] = [
    { id: "split-triple-start", minPx: 80, gutterAriaLabel: "Resize first" },
    { id: "split-triple-middle", minPx: 80, gutterAriaLabel: "Resize second" },
    { id: "split-triple-end", minPx: 80 },
];
