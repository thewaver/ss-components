import { type ParentProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ShapeConst, Size2d, StringUtils } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import { Shape } from "../../Fundamentals/Shape/Shape";
import type { SurfaceProps } from "./Surface.types";

import * as styles from "./Surface.css";

const MOCK_SIZE_CB = (): Size2d => ({ width: 0, height: 0 });
const IS_COMPLEX_SVG_DEFS = (v: SVGDefs) => !!v.blend || !!v.clipPath || !!v.filter || !!v.gradientOrPattern;

const SurfaceSVG = (props: ParentProps<SurfaceProps>) => {
    const getBorderWidths = createMemo(() => {
        const namedWidths = props.getBorderWidths();

        return [
            namedWidths.borderTopWidth,
            namedWidths.borderRightWidth,
            namedWidths.borderBottomWidth,
            namedWidths.borderLeftWidth,
        ];
    });

    const getJoinRadii = createMemo(() => {
        const namedRadii = props.getBorderRadii();

        return [
            namedRadii.borderTopLeftRadius,
            namedRadii.borderTopRightRadius,
            namedRadii.borderBottomRightRadius,
            namedRadii.borderBottomLeftRadius,
        ];
    });

    const getLameExponents = createMemo(() => {
        const namedShapes = props.getLameExponents?.();

        if (!namedShapes) return [ShapeConst.CORNER_SHAPE_LAME_EXPONENTS.round];

        return [
            namedShapes.cornerTopLeftShape,
            namedShapes.cornerTopRightShape,
            namedShapes.cornerBottomRightShape,
            namedShapes.cornerBottomLeftShape,
        ];
    });

    return (
        <Shape
            getPoints={(getSize) => ShapeConst.getDefaultShapePoints("square", getSize())}
            getFillDefs={props.getFillDefs}
            getStrokeDefs={
                props.getStrokeDefs
                    ? (getSize) => {
                          const strokeDefs = props.getStrokeDefs!(getSize);

                          return strokeDefs.map((def) => ({ ...def, thicknesses: getBorderWidths() }));
                      }
                    : undefined
            }
            joinRadii={getJoinRadii()}
            lameExponents={getLameExponents()}
            renderChildren={(_, getClipPath) => (
                <div style={{ "clip-path": `path("${getClipPath()}")` }}>{props.children}</div>
            )}
        />
    );
};

const SurfaceDiv = (props: ParentProps<SurfaceProps>) => {
    const getColor = (defsCb: typeof props.getFillDefs) => {
        const defsWithColor = defsCb?.(MOCK_SIZE_CB).find((v) => !!v.color);

        return defsWithColor
            ? `rgb(from ${defsWithColor.color} r g b / ${(defsWithColor.opacity ?? 1) * 100}%)`
            : "transparent";
    };

    const getBackgroundColor = createMemo(() => getColor(props.getFillDefs));

    const getBorderColor = createMemo(() => getColor(props.getStrokeDefs));

    const getHasBorder = createMemo(
        () => getBorderColor() !== "transparent" && Object.values(props.getBorderWidths()).some((v) => v > 0),
    );

    return (
        <div
            class={styles.surfaceDivRoot}
            style={{
                "background-color": getBackgroundColor(),
                ...Object.fromEntries(
                    Object.entries(props.getBorderRadii()).map(([key, value]) => [
                        StringUtils.camelToKebabCase(key),
                        `${value}px`,
                    ]),
                ),
            }}
        >
            {props.children}
            {getHasBorder() && (
                <div
                    class={styles.surfaceDivBorder}
                    style={{
                        "border-color": getBorderColor(),
                        ...Object.fromEntries(
                            Object.entries(props.getBorderWidths()).map(([key, value]) => [
                                StringUtils.camelToKebabCase(key),
                                `${value}px`,
                            ]),
                        ),
                    }}
                />
            )}
        </div>
    );
};

export const Surface = (props: SurfaceProps) => {
    const getIsComplex = () => {
        const fillDefs = props.getFillDefs?.(MOCK_SIZE_CB);
        const strokeDefs = props.getStrokeDefs?.(MOCK_SIZE_CB);
        const lameExponents = props.getLameExponents?.();

        return (
            fillDefs?.some(IS_COMPLEX_SVG_DEFS) ||
            strokeDefs?.some(IS_COMPLEX_SVG_DEFS) ||
            (lameExponents &&
                Object.values(lameExponents).some((v) => v !== ShapeConst.CORNER_SHAPE_LAME_EXPONENTS.round))
        );
    };

    return <Dynamic component={getIsComplex() ? SurfaceSVG : SurfaceDiv} {...props} />;
};
