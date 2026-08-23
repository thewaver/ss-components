import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldPresetProps } from "../TextField/TextField.types";

export type TextAreaProps = Omit<TextFieldPresetProps, "type" | "min" | "max" | "step"> &
    AccessorProps<{
        isAutoSizing?: boolean;
        minRows?: number;
        maxRows?: number;
    }>;
