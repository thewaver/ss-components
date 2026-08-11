import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { CalendarFlags } from "../../../../Lib/Fundamentals/Input/Calendar/Calendar.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CalendarDayProps = AccessorProps<{
    flags: InteractionFlags<CalendarFlags>;
}>;

export type CalendarTitleProps = AccessorProps<{
    flags: InteractionFlags;
}>;
