import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CheckboxExampleProps = {
    checkedSignal: Signal<boolean>;
};

export type CheckboxMixedExampleProps = AccessorProps<{
    allSignal: Signal<boolean>;
    firstChildSignal: Signal<boolean>;
    secondChildSignal: Signal<boolean>;
    isMixed: boolean;
}>;

export type CheckboxRefusedWriteExampleProps = {
    emailSignal: Signal<boolean>;
    smsSignal: Signal<boolean>;
};
