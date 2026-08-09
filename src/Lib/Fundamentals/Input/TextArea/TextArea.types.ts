import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldPresetProps } from "../TextField/TextField.types";

export type TextAreaProps = Omit<TextFieldPresetProps, "getType" | "getMin" | "getMax" | "getStep"> &
    AccessorProps<{
        isAutoSizing?: boolean;
        minRows?: number;
        maxRows?: number;
    }>;
