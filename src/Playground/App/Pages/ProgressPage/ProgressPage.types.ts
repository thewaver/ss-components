import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ProgressExampleProps = AccessorProps<{
    uploadedBytes: number;
    uploadTotalBytes: number;
}>;
