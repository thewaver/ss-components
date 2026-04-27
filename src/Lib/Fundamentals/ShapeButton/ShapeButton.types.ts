import { JSX } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { AccessorProps } from "../../Utils/typeUtils";
import { ButtonCbs, ButtonFlags, ButtonOutlineDefs, ExternalButtonFlags } from "../Button/Button.types";

export type ShapeButtonShape = "hexagon" | "lozenge";

export type ShapeButtonSVGDefs = {
    filter?: {
        id: string;
        defsElement: JSX.Element;
    };
} & (
    | {
          color?: never;
          gradient: {
              defsElement: JSX.Element;
              id: string;
          };
      }
    | {
          color: string;
          gradient?: never;
      }
);

export type ShapeButtonProps = AccessorProps<
    ButtonCbs &
        ExternalButtonFlags &
        Size2d & {
            id?: string;
            className?: string;
            shape: ShapeButtonShape;
            transitionDurationMs?: number;
            outlineDefs?: ButtonOutlineDefs;
            getFillDefs: (getFlags: () => ButtonFlags) => ShapeButtonSVGDefs;
            getStrokeDefs: (getFlags: () => ButtonFlags) => ShapeButtonSVGDefs & { width?: number; dashArray?: string };
        }
>;
