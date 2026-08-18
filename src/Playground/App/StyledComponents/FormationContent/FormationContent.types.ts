import type { Accessor, ParentProps } from "solid-js";

import type { ShapeConst } from "@thewaver/ss-utils";

import type { FormationItemState } from "../../../../Lib/Exotics/Formation/Formation.types";

export type PageFormationItemProps = ParentProps<{
    getState: Accessor<FormationItemState>;
    getShapeKind: Accessor<ShapeConst.DefaultShape>;
}>;
