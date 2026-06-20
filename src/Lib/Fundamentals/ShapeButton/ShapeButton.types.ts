import { Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { ButtonCbs, ButtonFlags, ButtonOutlineDefs, ExternalButtonFlags } from "../Button/Button.types";

export type ShapeButtonShape = "hexagon-top" | "hexagon-side" | "lozenge";

export type ShapeButtonProps = AccessorProps<
    ButtonCbs &
        ExternalButtonFlags &
        Size2d & {
            id?: string;
            className?: string;
            shape: ShapeButtonShape;
            transitionDurationMs?: number;
            outlineDefs?: ButtonOutlineDefs;
            getFillDefs: (getFlags: () => ButtonFlags) => SVGDefs;
            getStrokeDefs: (getFlags: () => ButtonFlags) => SVGDefs & { width?: number; dashArray?: string };
        }
>;
