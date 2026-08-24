import type { JSX } from "solid-js";

import { Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import type { DismissReason } from "../../Abstracts/Dismiss/DismissStack.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type PopoverRole = "listbox" | "menu" | "dialog";

export type PopoverProps = AccessorProps<{
    id: string;
    role: PopoverRole;
    ariaAttributes?: JSX.AriaAttributes;
    placement?: AnchorPlacement;
    offset?: Point2d;
    reservedScreenSize?: Size2d;
    transitionDurationMs?: number;
    hasAnchorMinWidth?: boolean;
    hasAutoFocus?: boolean;
    isOpen: boolean;
    anchorRef: HTMLElement | undefined;
    onKeyDown?: (e: KeyboardEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onDismiss?: (reason: DismissReason) => void;
    onTransitionStatusChange?: (hasTransitionFinished: boolean) => void;
    renderContent: (
        getVisibilityTarget: () => 0 | 1,
        getTransitionDurationMs: () => number,
        getPlacement: () => AnchorPlacement,
    ) => JSX.Element;
}> & {
    anchorRect?: MaybeAccessor<Rect | undefined>;
};
