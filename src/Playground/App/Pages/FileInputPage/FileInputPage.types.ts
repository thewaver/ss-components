import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type FileInputExampleProps = {
    filesSignal: Signal<File[]>;
};

export type FileInputRejectingExampleProps = FileInputExampleProps &
    AccessorProps<{
        rejection: string;
        onRejectionChange: (rejection: string) => void;
    }>;
