import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TabsExampleProps = AccessorProps<{
    selectedValue: string | undefined;
    hasAutoActivation?: boolean;
}> & {
    onSelectionChange: (value: string) => void;
};
