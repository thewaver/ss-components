import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { PageSatelliteBadgeProps, PageSatelliteSubjectProps } from "./SatelliteContent.types";

import * as styles from "./SatelliteContent.css";

export const PageSatelliteSubject = (props: ParentProps<PageSatelliteSubjectProps>) => {
    return (
        <div
            class={styles.satelliteSubject}
            style={{ width: `${access(props.width)}px`, height: `${access(props.height)}px` }}
        >
            {props.children}
        </div>
    );
};

export const PageSatelliteBadge = (props: ParentProps<PageSatelliteBadgeProps>) => {
    return (
        <div
            class={styles.satelliteBadge}
            classList={{ [styles.satelliteBadgeMuted]: access(props.isMuted) }}
            style={{ width: `${access(props.size)}px`, height: `${access(props.size)}px` }}
        >
            {props.children}
        </div>
    );
};
