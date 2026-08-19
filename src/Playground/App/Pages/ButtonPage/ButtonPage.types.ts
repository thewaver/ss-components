import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ButtonExampleProps = AccessorProps<{
    onClick: () => void;
}>;

export type ButtonPressedExampleProps = ButtonExampleProps &
    AccessorProps<{
        isPressed: boolean;
    }>;

export type ButtonErroredExampleProps = ButtonExampleProps &
    AccessorProps<{
        hasError: boolean;
    }>;
