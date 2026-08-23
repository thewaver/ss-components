import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const ErroredExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        hasError={() => props.filesSignal[0]().length < 1}
        ariaLabel={"Required attachment"}
        renderContent={(getFlags) => <PageFileInputContent flags={getFlags} />}
    />
);
