import type { Tab } from "../../../../Lib/Fundamentals/Tabs/Tabs.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScrollerExampleProps = AccessorProps<{
    labels: string[];
}>;

export type ScrollerTabbedExampleProps = AccessorProps<{
    tabs: Tab<string>[];
    selectedValue: string;
}> & {
    onSelectionChange: (value: string) => void;
};
