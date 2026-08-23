import type { ParentProps } from "solid-js";

import type { PageSatelliteBadgeProps, PageSatelliteSubjectProps } from "./SatelliteContent.types";

import * as styles from "./SatelliteContent.css";

export const PageSatelliteSubject = (props: ParentProps<PageSatelliteSubjectProps>) => (
    <div class={styles.satelliteSubject} style={{ width: `${props.getWidth()}px`, height: `${props.getHeight()}px` }}>
        {props.children}
    </div>
);

export const PageSatelliteBadge = (props: ParentProps<PageSatelliteBadgeProps>) => (
    <div
        class={styles.satelliteBadge}
        classList={{ [styles.satelliteBadgeMuted]: props.getIsMuted?.() }}
        style={{ width: `${props.getSize()}px`, height: `${props.getSize()}px` }}
    >
        {props.children}
    </div>
);
