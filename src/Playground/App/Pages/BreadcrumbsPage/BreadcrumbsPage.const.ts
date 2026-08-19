import type { CrumbValue } from "./BreadcrumbsPage.types";

export const BREADCRUMBS_GAP = 0;

export const TRAIL: { value: CrumbValue; label: string }[] = [
    { value: "home", label: "Home" },
    { value: "library", label: "Library" },
    { value: "inputs", label: "Inputs" },
    { value: "text", label: "Text" },
    { value: "field", label: "Field" },
];

export const labelOf = (value: CrumbValue) => TRAIL.find((entry) => entry.value === value)!.label;
