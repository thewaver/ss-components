import { Size2d } from "@thewaver/ss-utils";

import { AccessorProps } from "../../../../Utils/typeUtils";
import { ButtonCbs, ButtonFlags } from "../../Button.types";

export type ButtonShape = "hexagon" | "lozenge";

export type ShapeButtonColorDefs = {
    color: string;
    strokeColor: string;
};

export type ShapeButtonProps = AccessorProps<
    ButtonCbs &
        ButtonFlags &
        Size2d & {
            id?: string;
            className?: string;
            shape: ButtonShape;
            strokeWidth?: number;
            colorDefs?: ShapeButtonColorDefs;
        }
>;
