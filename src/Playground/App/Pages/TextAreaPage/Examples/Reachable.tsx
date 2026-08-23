import { TextArea } from "../../../../../Lib/Fundamentals/Input/TextArea/TextArea";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import { FIELD_WIDTH, FIXED_HEIGHT } from "../TextAreaPage.const";
import type { TextAreaExampleProps } from "../TextAreaPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TextAreaExampleProps;

export const ReachableExample = (props: Props) => (
    <TextArea
        valueSignal={props.valueSignal}
        isDisabled={true}
        isReachableWhenDisabled={true}
        padding={() => FIELD_PADDING}
        gap={() => FIELD_GAP}
        ariaLabel={"Disabled but reachable notes"}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => (
            <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} height={() => FIXED_HEIGHT} />
        )}
        tooltipDefs={() => ({
            placement: () => ({ x: "center", y: "top-out" }),
            offset: () => ({ x: 0, y: 5 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    Focusable so this tooltip can be read, but typing must leave the value alone.
                </PageTooltipContent>
            ),
        })}
    />
);
