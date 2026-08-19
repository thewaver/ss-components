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

type Props = TagInputExampleProps & { getAriaLabel?: () => string };

export const DefaultExample = (props: Props) => (
    <TagInput
        valueSignal={props.valueSignal}
        getAriaLabel={() => props.getAriaLabel?.() ?? "Topics"}
        getGap={() => FIELD_GAP}
        getPadding={() => FIELD_PADDING}
        getMinHeight={() => FIELD_HEIGHT}
        getIsDisabled={props.getIsDisabled}
        getHasError={props.getHasError}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTagInputContent getFlags={getFlags} />}
        renderPlaceholder={() => <PageTagInputPlaceholder>Type and press Enter</PageTagInputPlaceholder>}
        renderTag={(getTag, getFlags) => <PageTagContent getFlags={getFlags}>{getTag()}</PageTagContent>}
    />
);
