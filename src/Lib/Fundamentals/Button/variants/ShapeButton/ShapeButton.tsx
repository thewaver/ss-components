import { ParentProps, createMemo } from "solid-js";
import { createStore } from "solid-js/store";

import { PolygonUtils } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { ButtonFlags, InternalButtonFlags } from "../../Button.types";
import { ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../../Button.css";
import * as styles from "./ShapeButton.css";

const DEFAULT_SHAPE_BUTTON_STROKE_WIDTH = 2;
const DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS = 100;

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const [internalFlags, setInternalFlags] = createStore<InternalButtonFlags>({});

    const getFlags = createMemo(
        (): ButtonFlags => ({
            ...internalFlags,
            isDisabled: props.getIsDisabled?.(),
            isSelected: props.getIsSelected?.(),
            hasError: props.getHasError?.(),
        }),
    );

    const getFillDefs = createMemo(() => {
        return props.getFillDefs(getFlags);
    });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs(getFlags);
    });

    const getStrokeWidth = createMemo(() => {
        return getStrokeDefs().width ?? DEFAULT_SHAPE_BUTTON_STROKE_WIDTH;
    });

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS,
    );

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    const getPolygonPointsWithPadding = () => {
        const width = props.getWidth();
        const height = props.getHeight();

        switch (props.getShape()) {
            case "lozenge":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.5 },
                ];

            case "hexagon":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height / 3 },
                    { x: width, y: (height / 3) * 2 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: (height / 3) * 2 },
                    { x: 0, y: height / 3 },
                ];
        }
    };

    const getPolygonPoints = createMemo(() => {
        const points = getPolygonPointsWithPadding();

        return {
            fill: PolygonUtils.pointsToSVGString(points),
            stroke: PolygonUtils.pointsToSVGString(PolygonUtils.insetPolygon(points, getStrokeWidth() * 0.5)),
        };
    });

    return (
        <div
            class={styles.shapeButtonRoot}
            classList={{
                [buttonStyles.buttonError]: props.getHasError?.(),
                [buttonStyles.buttonSelected]: props.getIsSelected?.(),
            }}
            style={{
                width: `${props.getWidth()}px`,
                height: `${props.getHeight()}px`,
                ...assignInlineVars({
                    [styles.shapeButtonTransitionDurationMs]: `${getTransitionDurationMs()}ms`,
                }),
            }}
        >
            <svg
                id={props.getId?.()}
                class={styles.shapeButtonSVG}
                width={props.getWidth()}
                height={props.getHeight()}
                viewBox={`0 0 ${props.getWidth()} ${props.getHeight()}`}
                overflow="visible"
            >
                <defs>
                    {getFillDefs().filter?.defsElement}
                    {getFillDefs().gradient?.defsElement}
                    {getStrokeDefs().filter?.defsElement}
                    {getStrokeDefs().gradient?.defsElement}
                </defs>

                <g
                    role="button"
                    tabIndex={getTabIndex()}
                    aria-disabled={props.getIsDisabled?.()}
                    aria-selected={props.getIsSelected?.()}
                    onClick={!props.getIsDisabled?.() ? props.onClick : undefined}
                    onFocus={() => {
                        setInternalFlags("isFocused", true);
                    }}
                    onBlur={() => {
                        setInternalFlags("isFocused", false);
                    }}
                    onMouseEnter={(e) => {
                        props.onMouseEnter?.(e);
                        setInternalFlags("isHovered", true);
                    }}
                    onMouseLeave={(e) => {
                        props.onMouseLeave?.(e);
                        setInternalFlags("isHovered", false);
                    }}
                    onMouseDown={(e) => {
                        if (props.getIsDisabled?.()) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onKeyDown={async (e) => {
                        if (props.getIsDisabled?.()) {
                            e.preventDefault();
                            e.stopPropagation();
                        } else if (e.key === "Enter" || e.key === " ") {
                            if (e.key === " ") {
                                e.preventDefault();
                            }

                            await props.onClick?.(e);
                        }
                    }}
                >
                    <polygon
                        class={styles.shapeButtonPolygon}
                        points={getPolygonPoints().fill}
                        filter={getFillDefs().filter ? `url(#${getFillDefs().filter?.id})` : undefined}
                        fill={getFillDefs().gradient ? `url(#${getFillDefs().gradient?.id})` : getFillDefs().color}
                    />

                    <polygon
                        class={styles.shapeButtonPolygon}
                        points={getPolygonPoints().stroke}
                        filter={getStrokeDefs().filter ? `url(#${getStrokeDefs().filter?.id})` : undefined}
                        stroke={
                            getStrokeDefs().gradient ? `url(#${getStrokeDefs().gradient?.id})` : getStrokeDefs().color
                        }
                        stroke-dasharray={getStrokeDefs().dashArray}
                        stroke-width={getStrokeWidth()}
                        fill="transparent"
                    />
                </g>
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
