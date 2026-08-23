import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { TextInput } from "../../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import type { TextInputExampleProps } from "../TextInputPage.types";

import { FIELD_GAP, FIELD_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const LABEL_GAP = 5;

type Props = TextInputExampleProps;

export const LabelledExample = (props: Props) => (
    <Label dir={"column"} gap={() => LABEL_GAP}>
        <PageLabelCaption>Display name</PageLabelCaption>

        <TextInput
            valueSignal={props.valueSignal}
            padding={() => FIELD_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} />}
        />
    </Label>
);
