import { FileInput } from "../../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { PageFileInputContent } from "../../../StyledComponents/FileInputContent/FileInputContent";
import type { FileInputExampleProps } from "../FileInputPage.types";

type Props = FileInputExampleProps;

export const ImagesExample = (props: Props) => (
    <FileInput
        filesSignal={props.filesSignal}
        getAccept={() => "image/*"}
        getAriaLabel={() => "Avatar"}
        renderContent={(getFlags) => <PageFileInputContent getFlags={getFlags} />}
    />
);
