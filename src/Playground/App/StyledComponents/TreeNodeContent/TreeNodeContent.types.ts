import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TreeNodeFlags } from "../../../../Lib/Fundamentals/Tree/Tree.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TreeNodeContentProps = AccessorProps<{
    flags: InteractionFlags<TreeNodeFlags>;
    detail?: string;
}>;
