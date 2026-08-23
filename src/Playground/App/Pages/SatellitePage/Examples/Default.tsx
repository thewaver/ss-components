import { Satellite } from "../../../../../Lib/Exotics/Satellite/Satellite";
import { PageSatelliteBadge, PageSatelliteSubject } from "../../../StyledComponents/SatelliteContent/SatelliteContent";
import type { SatelliteExampleProps } from "../SatellitePage.types";

type Props = SatelliteExampleProps;

export const DefaultExample = ({
    getSubjectWidth,
    getSubjectHeight,
    getBadgeSize,
    getHasSatellite,
    ...otherProps
}: Props) => {
    return (
        <Satellite
            {...otherProps}
            renderSatellite={
                getHasSatellite()
                    ? () => <PageSatelliteBadge getSize={getBadgeSize}>{getBadgeSize()}</PageSatelliteBadge>
                    : undefined
            }
        >
            <PageSatelliteSubject getWidth={getSubjectWidth} getHeight={getSubjectHeight}>
                Subject
            </PageSatelliteSubject>
        </Satellite>
    );
};
