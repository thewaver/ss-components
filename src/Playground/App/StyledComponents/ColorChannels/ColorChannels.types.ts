import type { Signal } from "solid-js";

import type { Color } from "@thewaver/ss-utils";

export type PageColorChannelsProps = {
    hsvSignal: Signal<Color.HSVA>;
};
