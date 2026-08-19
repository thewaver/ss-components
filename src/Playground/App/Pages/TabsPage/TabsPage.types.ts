import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TabsExampleProps = AccessorProps<{
    selectedValue: string | undefined;
}> & {
    onSelectionChange: (value: string) => void;
};
