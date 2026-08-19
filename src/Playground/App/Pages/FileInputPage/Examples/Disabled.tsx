import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const DisabledExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        getIsDisabled={() => true}
        getAriaLabel={() => "Disabled attachment"}
        renderContent={(getFlags) => <PageFileInputContent getFlags={getFlags} />}
    />
);
