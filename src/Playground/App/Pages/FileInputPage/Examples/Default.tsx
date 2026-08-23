import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const DefaultExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        ariaLabel={"Attachment"}
        renderContent={(getFlags) => <PageFileInputContent flags={getFlags} />}
    />
);
