import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { FileInputFlags } from "../../../../Lib/Fundamentals/Input/FileInput/FileInput.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type FileInputContentProps = AccessorProps<{
    flags: InteractionFlags<FileInputFlags>;
    prompt: string;
}>;
