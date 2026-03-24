import { Size2d } from "@thewaver/ss-utils";

import { ColorKey } from "../../../../Abstracts/Color/Color.types";
import { AccessorProps } from "../../../../Utils/typeUtils";
import { ButtonCbs, ButtonFlags } from "../../Button.types";

export type ButtonShape = "hexagon" | "lozenge";

export type ShapeButtonColorDefs = {
    color: ColorKey;
    strokeColor: ColorKey;
};

export type ShapeButtonProps = AccessorProps<
    ButtonCbs &
        ButtonFlags &
        Size2d & {
            id?: string;
            className?: string;
            shape: ButtonShape;
            colorDefs?: ShapeButtonColorDefs;
        }
>;
