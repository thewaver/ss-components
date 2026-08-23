import type { TimeValue } from "@thewaver/ss-utils";

import { TimeInput } from "../../../../../Lib/Fundamentals/Input/TimeInput/TimeInput";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageMeridiemToggle } from "../../../StyledComponents/MeridiemToggle/MeridiemToggle";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH } from "../DatePickerPage.const";
import type { TimeExampleProps } from "../DatePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TimeExampleProps & {
    ariaLabel: MaybeAccessor<string>;
    isTwelveHour?: MaybeAccessor<boolean>;
    hasSeconds?: MaybeAccessor<boolean>;
    minTime?: MaybeAccessor<TimeValue>;
    maxTime?: MaybeAccessor<TimeValue>;
};

export const TimeExample = (props: Props) => {
    return (
        <TimeInput
            valueSignal={props.valueSignal}
            isTwelveHour={props.isTwelveHour}
            hasSeconds={props.hasSeconds}
            minTime={props.minTime}
            maxTime={props.maxTime}
            ariaLabel={props.ariaLabel}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderTrailing={
                access(props.isTwelveHour)
                    ? (getFlags, meridiem) => (
                          <PageMeridiemToggle
                              meridiem={meridiem.getValue}
                              isDisabled={() => getFlags().isDisabled ?? false}
                              onToggle={meridiem.toggle}
                          />
                      )
                    : undefined
            }
        />
    );
};
