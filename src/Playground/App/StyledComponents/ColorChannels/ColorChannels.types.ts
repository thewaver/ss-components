import type { Signal } from "solid-js";

import type { ColorValueHsv } from "../../../../Lib/Abstracts/ColorValue/ColorValue.types";

export type PageColorChannelsProps = {
    hsvSignal: Signal<ColorValueHsv>;
};
