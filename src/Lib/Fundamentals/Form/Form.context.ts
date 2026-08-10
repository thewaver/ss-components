import { createContext, useContext } from "solid-js";

import type { FormContextType } from "./Form.context.types";

const FormContext = createContext<FormContextType>();

export const FormContextProvider = FormContext.Provider;

export const useFormContext = () => useContext(FormContext);
