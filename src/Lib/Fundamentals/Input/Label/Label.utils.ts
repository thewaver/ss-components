import { useLabelContext } from "./Label.context";

export namespace LabelUtils {
    export const resolveAriaLabel = (getAriaLabel?: () => string) => {
        const labelContext = useLabelContext();

        if (labelContext.getIsLabelled() && getAriaLabel) {
            console.warn(
                "Label: getAriaLabel was given inside a Label, and is being ignored. An aria-label overrides the visible caption as the accessible name, which leaves the two disagreeing — drop one of them.",
            );
        }

        return () => (labelContext.getIsLabelled() ? undefined : getAriaLabel?.());
    };
}
