import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { ColorAreaFlags } from "../../../../Lib/Fundamentals/Input/ColorArea/ColorArea.types";
import type { RangeFlags } from "../../../../Lib/Fundamentals/Input/Range/Range.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ColorAreaContentProps = AccessorProps<{
    flags: InteractionFlags<ColorAreaFlags>;
    size: number;
}>;

export type ColorSwatchProps = AccessorProps<{
    value: string;
}>;

export type ColorFieldTriggerProps = AccessorProps<{
    flags: InteractionFlags;
}>;

export type HueSliderProps = AccessorProps<{
    flags: InteractionFlags<RangeFlags>;
}>;
