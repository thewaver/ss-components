import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageSatelliteSubjectProps = ParentProps<
    AccessorProps<{
        width: number;
        height: number;
    }>
>;

export type PageSatelliteBadgeProps = ParentProps<
    AccessorProps<{
        size: number;
        isMuted?: boolean;
    }>
>;
