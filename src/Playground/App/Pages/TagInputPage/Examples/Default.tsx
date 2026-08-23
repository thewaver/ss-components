import { TagInput } from "../../../../../Lib/Fundamentals/Input/TagInput/TagInput";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
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

type Props = TagInputExampleProps & { ariaLabel?: MaybeAccessor<string> };

export const DefaultExample = (props: Props) => {
    return (
        <TagInput
            valueSignal={props.valueSignal}
            ariaLabel={() => access(props.ariaLabel) ?? "Topics"}
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
    );
};
