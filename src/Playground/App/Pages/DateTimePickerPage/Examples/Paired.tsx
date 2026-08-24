import { DateTimeValueUtils } from "../../../../../Lib/Abstracts/DateTimeValue/DateTimeValue.utils";
import { DateInput } from "../../../../../Lib/Fundamentals/Input/DateInput/DateInput";
import { TimeInput } from "../../../../../Lib/Fundamentals/Input/TimeInput/TimeInput";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { FIELD_WIDTH, LOCALE } from "../../DatePickerPage/DatePickerPage.const";
import type { DateTimeExampleProps } from "../DateTimePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";
import * as styles from "../DateTimePickerPage.css";

type Props = DateTimeExampleProps;

export const PairedExample = (props: Props) => {
    const { dateSignal, timeSignal } = DateTimeValueUtils.createSplit(props.valueSignal);

    return (
        <div class={styles.dateTimeRow}>
            <DateInput
                valueSignal={dateSignal}
                ariaLabel={"Date"}
                locale={() => LOCALE}
                padding={() => FIELD_STEPPER_PADDING}
                gap={() => FIELD_GAP}
                computeTextStyle={computePageTextFieldTextStyle}
                renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
                renderPlaceholder={(getFlags, hint) => (
                    <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
                )}
            />

            <TimeInput
                valueSignal={timeSignal}
                ariaLabel={"Time"}
                padding={() => FIELD_STEPPER_PADDING}
                gap={() => FIELD_GAP}
                computeTextStyle={computePageTextFieldTextStyle}
                renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
                renderPlaceholder={(getFlags, hint) => (
                    <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
                )}
            />
        </div>
    );
};
