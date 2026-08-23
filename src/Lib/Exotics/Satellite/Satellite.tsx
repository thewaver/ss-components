import type { ParentProps } from "solid-js";
import { Show, createMemo, createSignal } from "solid-js";

import { CSSUtils, type Point2d, StringUtils } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { access } from "../../Utils/propUtils";
import type { SatelliteProps } from "./Satellite.types";
import { SatelliteUtils } from "./Satellite.utils";

import * as styles from "./Satellite.css";

const DEFAULT_SATELLITE_PLACEMENT: AnchorPlacement = { x: "center", y: "center" };
const DEFAULT_SATELLITE_OFFSET: Point2d = { x: 0, y: 0 };
const SUBJECT_Z_INDEX = 0;
const RAISED_SUBJECT_Z_INDEX = 1;

export const Satellite = (props: ParentProps<SatelliteProps>) => {
    const [getSubjectRef, setSubjectRef] = createSignal<HTMLElement>();
    const [getSatelliteRef, setSatelliteRef] = createSignal<HTMLElement>();

    const getSubjectSize = ElementObserver.createBorderBoxSizeObserver(getSubjectRef);

    const getSatelliteSize = ElementObserver.createBorderBoxSizeObserver(getSatelliteRef);

    const getPlacement = createMemo(() => access(props.placement) ?? DEFAULT_SATELLITE_PLACEMENT);

    const getOffset = createMemo(() => access(props.offset) ?? DEFAULT_SATELLITE_OFFSET);

    const getLayout = createMemo(() =>
        SatelliteUtils.computeLayout(getSubjectSize(), getSatelliteSize(), getPlacement(), getOffset()),
    );

    return (
        <Show when={props.renderSatellite} fallback={props.children}>
            <div
                class={styles.satelliteRoot}
                style={CSSUtils.spreadableToStyle(getLayout().padding, StringUtils.camelToKebabCase)}
            >
                <div
                    ref={setSubjectRef}
                    class={styles.satelliteSubject}
                    style={{
                        "z-index": access(props.isBehindSubject) ? RAISED_SUBJECT_Z_INDEX : SUBJECT_Z_INDEX,
                    }}
                >
                    {props.children}
                </div>

                <div
                    ref={setSatelliteRef}
                    class={styles.satelliteBody}
                    style={{
                        left: `${getLayout().satelliteOffset.x}px`,
                        top: `${getLayout().satelliteOffset.y}px`,
                    }}
                >
                    {props.renderSatellite?.()}
                </div>
            </div>
        </Show>
    );
};
