import type { TimeValue } from "@thewaver/ss-utils";

import { TimeInput } from "../../../../../Lib/Fundamentals/Input/TimeInput/TimeInput";
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
    getAriaLabel: () => string;
    getIsTwelveHour?: () => boolean;
    getHasSeconds?: () => boolean;
    getMinTime?: () => TimeValue;
    getMaxTime?: () => TimeValue;
};

export const TimeExample = (props: Props) => (
    <TimeInput
        valueSignal={props.valueSignal}
        getIsTwelveHour={props.getIsTwelveHour}
        getHasSeconds={props.getHasSeconds}
        getMinTime={props.getMinTime}
        getMaxTime={props.getMaxTime}
        getAriaLabel={props.getAriaLabel}
        getPadding={() => FIELD_STEPPER_PADDING}
        getGap={() => FIELD_GAP}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
        renderPlaceholder={(getFlags, hint) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        )}
        renderTrailing={
            props.getIsTwelveHour?.()
                ? (getFlags, meridiem) => (
                      <PageMeridiemToggle
                          getMeridiem={meridiem.getValue}
                          getIsDisabled={() => getFlags().isDisabled ?? false}
                          onToggle={meridiem.toggle}
                      />
                  )
                : undefined
        }
    />
);
