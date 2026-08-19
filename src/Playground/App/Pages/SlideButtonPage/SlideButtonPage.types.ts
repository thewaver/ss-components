import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SlideButtonExampleProps = {
    onActivate: () => void;
};

export type SlideButtonHeldExampleProps = AccessorProps<{
    isArmed: boolean;
}> & {
    onActivate: () => void;
    onReset: () => void;
};

export type SlideButtonErroredExampleProps = AccessorProps<{
    hasError: boolean;
}> & {
    onActivate: () => void;
};
