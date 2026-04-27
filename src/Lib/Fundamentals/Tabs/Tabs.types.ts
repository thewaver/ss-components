import { JSX } from "solid-js";

import { AccessorProps } from "../../Utils/typeUtils";

export type TabProps = AccessorProps<{
    dir?: "column" | "row";
    selectedIndex: number;
    tabCount: number;
    tabGap?: number;
    transitionDurationMs?: number;
    getIsDisabled?: (getIndex: () => number) => boolean;
    renderFloater?: () => JSX.Element;
    renderTab: (getIndex: () => number) => JSX.Element;
    onSelectionChange?: (newIndex: number) => void;
}>;
