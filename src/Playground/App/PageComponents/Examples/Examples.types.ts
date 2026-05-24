import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { PageExampleDefs } from "../../Pages/Pages.types";

export type ExamplesProps = AccessorProps<{
    items: PageExampleDefs[];
}>;
