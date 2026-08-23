import { TagInput } from "../../../../../Lib/Fundamentals/Input/TagInput/TagInput";
import {
    PageTagContent,
    PageTagInputContent,
    PageTagInputPlaceholder,
} from "../../../StyledComponents/TagInputContent/TagInputContent";
import { computePageTextFieldTextStyle } from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import type { TagInputExampleProps } from "../TagInputPage.types";

import {
    FIELD_GAP,
    FIELD_HEIGHT,
    FIELD_PADDING,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

const NARROW_WIDTH = 240;

type Props = TagInputExampleProps;

export const CrowdedExample = (props: Props) => {
    return (
        <div style={{ width: `${NARROW_WIDTH}px` }}>
            <TagInput
                valueSignal={props.valueSignal}
                ariaLabel={"Crowded topics"}
                gap={() => FIELD_GAP}
                padding={() => FIELD_PADDING}
                minHeight={() => FIELD_HEIGHT}
                isDisabled={props.isDisabled}
                hasError={props.hasError}
                computeTextStyle={computePageTextFieldTextStyle}
                renderContent={(getFlags) => <PageTagInputContent flags={getFlags} />}
                renderPlaceholder={() => <PageTagInputPlaceholder>Type and press Enter</PageTagInputPlaceholder>}
                renderTag={(getTag, getFlags) => <PageTagContent flags={getFlags}>{getTag()}</PageTagContent>}
            />
        </div>
    );
};
