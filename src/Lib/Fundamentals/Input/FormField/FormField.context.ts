import { createContext, useContext } from "solid-js";

import type { FormFieldContextType } from "./FormField.context.types";

const FormFieldContext = createContext<FormFieldContextType>();

export const FormFieldContextProvider = FormFieldContext.Provider;

const UNDESCRIBED_CONTEXT: FormFieldContextType = {
    getDescriptionId: () => undefined,
};

export const useFormFieldContext = (): FormFieldContextType => useContext(FormFieldContext) ?? UNDESCRIBED_CONTEXT;
