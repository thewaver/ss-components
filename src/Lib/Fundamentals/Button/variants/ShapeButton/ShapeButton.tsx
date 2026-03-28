import { ParentProps, createMemo } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { ButtonFlags, InternalButtonFlags } from "../../Button.types";
import { ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../../Button.css";
import * as styles from "./ShapeButton.css";

const DEFAULT_SHAPE_BUTTON_STROKE_WIDTH = 2;
const DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS = 100;

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const [internalFlags, setInternalFlags] = createStore<InternalButtonFlags>({});

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS,
    );

    const getStrokeWidth = createMemo(() => props.getStrokeWidth?.(getFlags) ?? DEFAULT_SHAPE_BUTTON_STROKE_WIDTH);

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    const getFlags = createMemo(
        (): ButtonFlags => ({
            ...internalFlags,
            isDisabled: props.getIsDisabled?.(),
            isSelected: props.getIsSelected?.(),
            hasError: props.getHasError?.(),
        }),
    );

    const getPolygonPoints = createMemo(() => {
        const padding = getStrokeWidth() * 0.5;
        const width = props.getWidth();
        const height = props.getHeight();

        switch (props.getShape()) {
            case "lozenge":
                return [
                    `${width * 0.5},${padding}`,
                    `${width - padding},${height * 0.5}`,
                    `${width * 0.5},${height - padding}`,
                    `${padding},${height * 0.5}`,
                ].join(" ");

            case "hexagon":
                return [
                    `${width * 0.5},${padding}`,
                    `${width - padding},${height / 3 + padding}`,
                    `${width - padding},${(height / 3) * 2 - padding}`,
                    `${width * 0.5},${height - padding}`,
                    `${padding},${(height / 3) * 2 - padding}`,
                    `${padding},${height / 3 + padding}`,
                ].join(" ");
        }
    });

    const getFillDefs = createMemo(() => {
        return props.getFillDefs(getFlags);
    });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs(getFlags);
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
                role="button"
                tabIndex={getTabIndex()}
                aria-disabled={props.getIsDisabled?.()}
                aria-selected={props.getIsSelected?.()}
                onClick={!props.getIsDisabled?.() ? props.onClick : undefined}
                onMouseEnter={(e) => {
                    props.onMouseEnter?.(e);
                    setInternalFlags("isHovered", true);
                }}
                onMouseLeave={(e) => {
                    props.onMouseLeave?.(e);
                    setInternalFlags("isHovered", false);
                }}
                onFocus={() => {
                    setInternalFlags("isFocused", true);
                }}
                onBlur={() => {
                    setInternalFlags("isFocused", false);
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
                <defs>
                    {getFillDefs().filter?.defsElement}
                    {getFillDefs().gradient?.defsElement}
                    {getStrokeDefs().filter?.defsElement}
                    {getStrokeDefs().gradient?.defsElement}
                </defs>

                <polygon
                    class={styles.shapeButtonPolygon}
                    points={getPolygonPoints()}
                    filter={getFillDefs().filter ? `url(#${getFillDefs().filter?.id})` : undefined}
                    fill={getFillDefs().gradient ? `url(#${getFillDefs().gradient?.id})` : getFillDefs().color}
                />

                <polygon
                    class={styles.shapeButtonPolygon}
                    points={getPolygonPoints()}
                    filter={getStrokeDefs().filter ? `url(#${getStrokeDefs().filter?.id})` : undefined}
                    stroke={getStrokeDefs().gradient ? `url(#${getStrokeDefs().gradient?.id})` : getStrokeDefs().color}
                    stroke-dasharray={props.getStrokeDashArray?.(getFlags)}
                    stroke-width={getStrokeWidth()}
                />
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
