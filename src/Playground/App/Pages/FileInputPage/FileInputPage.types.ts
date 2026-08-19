import type { Signal } from "solid-js";

export type FileInputExampleProps = {
    filesSignal: Signal<File[]>;
};

export type FileInputRejectingExampleProps = FileInputExampleProps & {
    getRejection: () => string;
    onRejectionChange: (rejection: string) => void;
};
