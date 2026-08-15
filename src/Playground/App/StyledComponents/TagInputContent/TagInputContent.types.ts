import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TagInputFlags } from "../../../../Lib/Fundamentals/Input/TagInput/TagInput.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TagInputContentProps = AccessorProps<{
    flags: InteractionFlags<TagInputFlags>;
}>;

export type TagContentProps = AccessorProps<{
    flags: InteractionFlags;
}>;
