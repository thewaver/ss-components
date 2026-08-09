import { createContext, useContext } from "solid-js";

import type { AccessorProps } from "../../../../Lib";
import type { PagePropsPanelScope } from "./PropsPanel.types";

const PropsPanelContext = createContext<AccessorProps<{ scope: PagePropsPanelScope }>>();

export const PropsPanelContextProvider = PropsPanelContext.Provider;

export const usePropsPanelContext = () => useContext(PropsPanelContext);
