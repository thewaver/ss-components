import type { ShapeConst } from "@thewaver/ss-utils";

import type { FormationItemState } from "../../../../Lib/Exotics/Formation/Formation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageFormationItemProps = AccessorProps<{
    state: FormationItemState;
    shapeKind: ShapeConst.DefaultShape;
}>;
