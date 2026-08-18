import type { PageSatelliteBadgeProps, PageSatelliteSubjectProps } from "./SatelliteContent.types";

import * as styles from "./SatelliteContent.css";

export const PageSatelliteSubject = (props: PageSatelliteSubjectProps) => (
    <div class={styles.satelliteSubject} style={{ width: `${props.getWidth()}px`, height: `${props.getHeight()}px` }}>
        {props.children}
    </div>
);

export const PageSatelliteBadge = (props: PageSatelliteBadgeProps) => (
    <div
        class={styles.satelliteBadge}
        classList={{ [styles.satelliteBadgeMuted]: props.getIsMuted?.() }}
        style={{ width: `${props.getSize()}px`, height: `${props.getSize()}px` }}
    >
        {props.children}
    </div>
);
