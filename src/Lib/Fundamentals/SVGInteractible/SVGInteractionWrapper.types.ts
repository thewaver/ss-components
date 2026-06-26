import type { JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";
import type { ButtonCbs, ButtonFlags, ExternalButtonFlags } from "../Button/Button.types";

export type SVGInteractionWrapperProps = AccessorProps<
    ButtonCbs &
        ExternalButtonFlags & {
            renderChildren: (getFlags: () => ButtonFlags) => JSX.Element;
        }
>;
