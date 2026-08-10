import { useFormFieldContext } from "./FormField.context";

export namespace FormFieldUtils {
    export const resolveAriaDescribedBy = (getAriaDescribedBy?: () => string) => {
        const fieldContext = useFormFieldContext();

        return () => {
            const ids = [getAriaDescribedBy?.(), fieldContext.getDescriptionId()].filter(Boolean);

            return ids.length > 0 ? ids.join(" ") : undefined;
        };
    };
}
