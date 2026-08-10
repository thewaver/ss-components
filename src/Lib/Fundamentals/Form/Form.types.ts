import type { JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type FormState = {
    isValid: boolean;
    hasSubmitted: boolean;
};

export type FormProps = AccessorProps<{
    id?: string;
    name?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    onSubmit?: () => void | Promise<void>;
    onReset?: () => void | Promise<void>;
    renderContent: (getState: () => FormState) => JSX.Element;
}>;
