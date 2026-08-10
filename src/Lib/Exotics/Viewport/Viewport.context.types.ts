import type { Accessor } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

export type ViewportContextType = {
    getPortalRef: Accessor<HTMLElement | undefined>;
    getSize: Accessor<Size2d>;
    getScale: Accessor<number>;
    getScaledRect: Accessor<DOMRect>;
};
