import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { BreadcrumbsFlags } from "../../../../Lib/Fundamentals/Breadcrumbs/Breadcrumbs.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type BreadcrumbContentProps = AccessorProps<{
    flags: InteractionFlags<BreadcrumbsFlags>;
}>;
