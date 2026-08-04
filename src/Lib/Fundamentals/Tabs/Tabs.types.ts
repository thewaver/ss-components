import type { Component, JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type TabLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type TabProps = AccessorProps<{
    dir?: "column" | "row";
    selectedIndex: number | undefined;
    tabCount: number;
    tabGap?: number;
    hrefs?: string[];
    linkComponent?: Component<TabLinkProps>;
    transitionDurationMs?: number;
    computeIsDisabled?: (index: number) => boolean;
    renderGutter?: () => JSX.Element;
    renderFloater?: () => JSX.Element;
    renderTab: (index: number) => JSX.Element;
    onSelectionChange?: (newIndex: number) => void;
}>;
