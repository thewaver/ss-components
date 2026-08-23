import { Satellite } from "../../../../../Lib/Exotics/Satellite/Satellite";
import { access } from "../../../../../Lib/Utils/propUtils";
import { PageSatelliteBadge, PageSatelliteSubject } from "../../../StyledComponents/SatelliteContent/SatelliteContent";
import type { SatelliteExampleProps } from "../SatellitePage.types";

type Props = SatelliteExampleProps;

export const DefaultExample = ({ subjectWidth, subjectHeight, badgeSize, hasSatellite, ...otherProps }: Props) => {
    return (
        <Satellite
            {...otherProps}
            renderSatellite={
                access(hasSatellite)
                    ? () => <PageSatelliteBadge size={badgeSize}>{access(badgeSize)}</PageSatelliteBadge>
                    : undefined
            }
        >
            <PageSatelliteSubject width={subjectWidth} height={subjectHeight}>
                Subject
            </PageSatelliteSubject>
        </Satellite>
    );
};
