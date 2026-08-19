import type { ParentProps } from "solid-js";

import type { PageWheelCardProps, PageWheelSpinProps, PageWheelWedgeProps } from "./WheelContent.types";

import * as styles from "./WheelContent.css";

const WEDGE_RADIUS = 50;
const WEDGE_CENTRE = 50;
const READABLE_WEDGE_COUNT = 12;

const getWedgePath = (wedgeCount: number) => {
    const wedgeAngle = (2 * Math.PI) / Math.max(1, wedgeCount);
    const startAngle = -Math.PI / 2 - wedgeAngle / 2;
    const endAngle = startAngle + wedgeAngle;
    const largeArcFlag = wedgeAngle > Math.PI ? 1 : 0;
    const startX = WEDGE_CENTRE + WEDGE_RADIUS * Math.cos(startAngle);
    const startY = WEDGE_CENTRE + WEDGE_RADIUS * Math.sin(startAngle);
    const endX = WEDGE_CENTRE + WEDGE_RADIUS * Math.cos(endAngle);
    const endY = WEDGE_CENTRE + WEDGE_RADIUS * Math.sin(endAngle);

    return `M ${WEDGE_CENTRE} ${WEDGE_CENTRE} L ${startX} ${startY} A ${WEDGE_RADIUS} ${WEDGE_RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
};

export const PageWheelWedge = (props: PageWheelWedgeProps) => (
    <div class={styles.wheelWedge}>
        <svg class={styles.wheelWedgeSVG} width="100%" height="100%" viewBox="0 0 100 100">
            <path
                class={styles.wheelWedgeShape}
                classList={{ [styles.isSelected]: props.getState().isSelected }}
                d={getWedgePath(props.getState().wedgeCount)}
            />
        </svg>

        <div
            class={styles.wheelWedgeLabel}
            style={{ transform: `scale(${Math.min(READABLE_WEDGE_COUNT / props.getState().wedgeCount, 1)})` }}
        >
            {props.children}
        </div>
    </div>
);

export const PageWheelCard = (props: PageWheelCardProps) => (
    <div
        class={styles.wheelCard}
        classList={{
            [styles.wheelCardBack]: props.getState().face === "back",
            [styles.isSelected]: props.getState().isSelected,
        }}
    >
        {props.getState().face === "front" && (
            <>
                <div class={styles.wheelCardRank}>{props.getRank?.() ?? props.getState().index + 1}</div>

                {props.children}
            </>
        )}
    </div>
);

export const PageWheelStack = (props: ParentProps) => <div class={styles.wheelStack}>{props.children}</div>;

export const PageWheelHub = (props: ParentProps) => <div class={styles.wheelHub}>{props.children}</div>;

export const PageWheelBar = (props: ParentProps) => <div class={styles.wheelBar}>{props.children}</div>;

export const PageWheelSpin = (props: PageWheelSpinProps) => (
    <div
        class={styles.wheelSpin}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isDisabled]: props.getFlags().isDisabled,
        }}
        aria-hidden
    >
        {props.getPhase() === "spinning" || props.getPhase() === "settling" ? "…" : "Spin"}
    </div>
);
