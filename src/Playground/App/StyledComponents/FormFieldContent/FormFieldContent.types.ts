import type { FormFieldState } from "../../../../Lib/Fundamentals/Input/FormField/FormField.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type FormFieldMessageProps = AccessorProps<{
    state: FormFieldState;
}>;
