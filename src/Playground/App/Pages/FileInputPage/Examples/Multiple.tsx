import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const MultipleExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        getIsMultiple={() => true}
        getAriaLabel={() => "Attachments"}
        renderContent={(getFlags) => <PageFileInputContent getFlags={getFlags} />}
    />
);
