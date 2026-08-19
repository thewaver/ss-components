import type { Signal } from "solid-js";

import type { Color } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ColorAreaExampleProps = AccessorProps<{
    isDisabled?: boolean;
    hsvSignal: Signal<Color.HSVA>;
}>;

export type ColorAreaDropdownExampleProps = ColorAreaExampleProps &
    AccessorProps<{
        popupId: string;
        isOpenSignal: Signal<boolean>;
        hueSignal: Signal<number>;
    }>;
