import { type ParentProps, createMemo, createUniqueId } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type {
    PageWheelCardProps,
    PageWheelPipProps,
    PageWheelPipSide,
    PageWheelSpinProps,
    PageWheelWedgeProps,
} from "./WheelContent.types";

import * as styles from "./WheelContent.css";

const WEDGE_RADIUS = 50;
const WEDGE_CENTRE = 50;
const LABEL_RADIUS = 44;
const LABEL_TYPE_RATIO = 0.14;
const PIP_PATH = "M 2 2 H 18 L 10 18 Z";

const PIP_SIDE_STYLES: Record<PageWheelPipSide, string> = {
    top: styles.wheelPipTop,
    left: styles.wheelPipLeft,
};

const toWheelWidth = (viewBoxUnits: number) => `${viewBoxUnits}cqw`;

const getWedgeGeometry = (wedgeCount: number) => {
    const wedgeAngle = (2 * Math.PI) / Math.max(1, wedgeCount);
    const startAngle = -Math.PI / 2 - wedgeAngle / 2;
    const endAngle = startAngle + wedgeAngle;
    const largeArcFlag = wedgeAngle > Math.PI ? 1 : 0;
    const startX = WEDGE_CENTRE + WEDGE_RADIUS * Math.cos(startAngle);
    const startY = WEDGE_CENTRE + WEDGE_RADIUS * Math.sin(startAngle);
    const endX = WEDGE_CENTRE + WEDGE_RADIUS * Math.cos(endAngle);
    const endY = WEDGE_CENTRE + WEDGE_RADIUS * Math.sin(endAngle);
    const edgeHalfWidth = LABEL_RADIUS * Math.tan(Math.min(wedgeAngle, Math.PI) / 2);
    const arcHalfWidth = Math.sqrt(WEDGE_RADIUS ** 2 - LABEL_RADIUS ** 2);
    const labelWidth = 2 * Math.min(edgeHalfWidth, arcHalfWidth);

    return {
        path: `M ${WEDGE_CENTRE} ${WEDGE_CENTRE} L ${startX} ${startY} A ${WEDGE_RADIUS} ${WEDGE_RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
        labelInset: (2 * WEDGE_RADIUS - labelWidth) / 2,
        labelTop: WEDGE_RADIUS - LABEL_RADIUS,
        labelTypeSize: labelWidth * LABEL_TYPE_RATIO,
    };
};

export const PageWheelWedge = (props: ParentProps<PageWheelWedgeProps>) => {
    const getGeometry = createMemo(() => getWedgeGeometry(access(props.state).wedgeCount));
    const gradientId = createUniqueId();

    return (
        <div class={styles.wheelWedge} classList={{ [styles.isSelected]: access(props.state).isSelected }}>
            <svg class={styles.wheelWedgeSVG} width="100%" height="100%" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop class={styles.wheelWedgeGradientFrom} offset="0%" />
                        <stop class={styles.wheelWedgeGradientTo} offset="100%" />
                    </linearGradient>
                </defs>

                <path
                    class={styles.wheelWedgeShape}
                    style={{ fill: access(props.state).isSelected ? `url(#${gradientId})` : undefined }}
                    d={getGeometry().path}
                />
            </svg>

            <div
                class={styles.wheelWedgeLabel}
                style={{
                    "top": toWheelWidth(getGeometry().labelTop),
                    "left": toWheelWidth(getGeometry().labelInset),
                    "right": toWheelWidth(getGeometry().labelInset),
                    "font-size": toWheelWidth(getGeometry().labelTypeSize),
                }}
            >
                {props.children}
            </div>
        </div>
    );
};

export const PageWheelCard = (props: ParentProps<PageWheelCardProps>) => {
    return (
        <div
            class={styles.wheelCard}
            classList={{
                [styles.wheelCardBack]: access(props.state).face === "back",
                [styles.isSelected]: access(props.state).isSelected,
            }}
        >
            {access(props.state).face === "front" && (
                <>
                    <div class={styles.wheelCardRank}>{access(props.rank) ?? access(props.state).index + 1}</div>

                    {props.children}
                </>
            )}
        </div>
    );
};

export const PageWheelStack = (props: ParentProps) => <div class={styles.wheelStack}>{props.children}</div>;

export const PageWheelMount = (props: ParentProps) => <div class={styles.wheelMount}>{props.children}</div>;

export const PageWheelPip = (props: PageWheelPipProps) => {
    return (
        <div class={PIP_SIDE_STYLES[access(props.side)]} aria-hidden>
            <svg class={styles.wheelPipShape} viewBox="0 0 20 20">
                <path d={PIP_PATH} />
            </svg>
        </div>
    );
};

export const PageWheelCentre = (props: ParentProps) => <div class={styles.wheelCentre}>{props.children}</div>;

export const PageWheelBar = (props: ParentProps) => <div class={styles.wheelBar}>{props.children}</div>;

export const PageWheelSpin = (props: PageWheelSpinProps) => {
    return (
        <div
            class={styles.wheelSpin}
            classList={{
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isDisabled]: access(props.flags).isDisabled,
            }}
            aria-hidden
        >
            {access(props.phase) === "spinning" || access(props.phase) === "settling" ? "…" : "Spin"}
        </div>
    );
};
