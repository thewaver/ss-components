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

type Props = TagInputExampleProps;

export const UniqueExample = (props: Props) => {
    return (
        <TagInput
            valueSignal={props.valueSignal}
            ariaLabel={"Unique topics"}
            gap={() => FIELD_GAP}
            padding={() => FIELD_PADDING}
            minHeight={() => FIELD_HEIGHT}
            isDisabled={props.isDisabled}
            hasError={props.hasError}
            computeTextStyle={computePageTextFieldTextStyle}
            computeTag={(text) => {
                const tag = text.trim().toLowerCase();

                return tag && !props.valueSignal[0]().includes(tag) ? tag : undefined;
            }}
            renderContent={(getFlags) => <PageTagInputContent flags={getFlags} />}
            renderPlaceholder={() => <PageTagInputPlaceholder>Type and press Enter</PageTagInputPlaceholder>}
            renderTag={(getTag, getFlags) => <PageTagContent flags={getFlags}>{getTag()}</PageTagContent>}
        />
    );
};
