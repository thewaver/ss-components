import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageSatelliteSubjectProps = AccessorProps<{
    width: number;
    height: number;
}>;

export type PageSatelliteBadgeProps = AccessorProps<{
    size: number;
    isMuted?: boolean;
}>;
