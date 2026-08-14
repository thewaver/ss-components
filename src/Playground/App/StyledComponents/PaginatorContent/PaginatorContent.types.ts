import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type {
    PaginatorGapEntry,
    PaginatorPageFlags,
    PaginatorStepFlags,
} from "../../../../Lib/Fundamentals/Paginator/Paginator.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PaginatorPageContentProps = AccessorProps<{
    flags: InteractionFlags<PaginatorPageFlags>;
}>;

export type PaginatorStepContentProps = AccessorProps<{
    flags: InteractionFlags<PaginatorStepFlags>;
}>;

export type PaginatorGapContentProps = AccessorProps<{
    entry: PaginatorGapEntry;
}>;
