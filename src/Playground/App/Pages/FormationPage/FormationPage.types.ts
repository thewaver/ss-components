import type { ShapeConst } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { FormationLayouts } from "../../Samples/FormationLayouts/FormationLayouts.const";

export type FormationExampleProps = AccessorProps<{
    items: string[];
    isStackedInReverse: boolean;
    layoutKey: FormationLayouts.SampleKey;
    shapeKind: ShapeConst.DefaultShape;
}>;
