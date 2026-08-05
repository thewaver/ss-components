import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PagePropProps = ParentProps<
    AccessorProps<{
        label: string;
    }>
>;
