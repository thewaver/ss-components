import { JSX } from "solid-js";

import { AccessorProps } from "../../Utils/typeUtils";

export type ButtonFlags = {
    isDisabled?: boolean;
    isSelected?: boolean;
    hasError?: boolean;
};

export type ButtonCbs = {
    onClick?: (e: MouseEvent | KeyboardEvent) => Promise<void>;
    onMouseEnter?: (e: MouseEvent) => Promise<void>;
    onMouseLeave?: (e: MouseEvent) => Promise<void>;
};

export type ButtonProps = AccessorProps<
    ButtonCbs &
        ButtonFlags & {
            id?: string;
            className?: string;
            renderCorners?: (getFlags: () => ButtonFlags) => JSX.Element;
            renderTooltip?: (anchorRect: HTMLDivElement | undefined, getFlags: () => ButtonFlags) => JSX.Element;
        }
>;
