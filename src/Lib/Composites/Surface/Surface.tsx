import { type ParentProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ShapeConst, Size2d, StringUtils } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import { Shape } from "../../Exotics/Shape/Shape";
import { access } from "../../Utils/propUtils";
import type { SurfaceProps } from "./Surface.types";

import * as styles from "./Surface.css";

const MOCK_SIZE: Size2d = { width: 0, height: 0 };
const MOCK_GET_SIZE = () => MOCK_SIZE;
const IS_COMPLEX_SVG_DEFS = (v: SVGDefs) => !!v.blend || !!v.clipPath || !!v.filter || !!v.gradientOrPattern;

const SurfaceSVG = (props: ParentProps<SurfaceProps>) => {
    const getBorderWidths = createMemo(() => {
        const namedWidths = access(props.borderWidths);

        return [
            namedWidths.borderTopWidth,
            namedWidths.borderRightWidth,
            namedWidths.borderBottomWidth,
            namedWidths.borderLeftWidth,
        ];
    });

    const getJoinRadii = createMemo(() => {
        const namedRadii = access(props.borderRadii);

        return [
            namedRadii.borderTopLeftRadius,
            namedRadii.borderTopRightRadius,
            namedRadii.borderBottomRightRadius,
            namedRadii.borderBottomLeftRadius,
        ];
    });

    const getLameExponents = createMemo(() => {
        const namedShapes = access(props.lameExponents);

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
            computePoints={(size) => ShapeConst.getDefaultShapePoints("square", size)}
            computeFillDefs={props.computeFillDefs}
            computeStrokeDefs={props.computeStrokeDefs}
            strokeGeom={props.computeStrokeDefs ? () => [{ thicknesses: getBorderWidths() }] : undefined}
            joinRadii={getJoinRadii}
            lameExponents={getLameExponents}
            renderChildren={(_, getClipPath) => (
                <div style={{ "clip-path": `path("${getClipPath()}")` }}>{props.children}</div>
            )}
        />
    );
};

const SurfaceDiv = (props: ParentProps<SurfaceProps>) => {
    const getFillColorDef = createMemo(() => props.computeFillDefs?.(MOCK_GET_SIZE)?.find((v) => !!v.color));
    const getStrokeColorDef = createMemo(() => props.computeStrokeDefs?.(MOCK_GET_SIZE)?.find((v) => !!v.color));

    const getHasBorder = createMemo(
        () => !!getStrokeColorDef() && Object.values(access(props.borderWidths)).some((v) => v > 0),
    );

    return (
        <div
            class={styles.surfaceDivRoot}
            style={{
                ...assignInlineVars({
                    [styles.fillColorVar]: getFillColorDef()?.color ?? "transparent",
                    [styles.fillOpacityVar]: `${(getFillColorDef()?.opacity ?? 1) * 100}%`,
                }),
                ...Object.fromEntries(
                    Object.entries(access(props.borderRadii)).map(([key, value]) => [
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
                        ...assignInlineVars({
                            [styles.strokeColorVar]: getStrokeColorDef()?.color ?? "transparent",
                            [styles.strokeOpacityVar]: `${(getStrokeColorDef()?.opacity ?? 1) * 100}%`,
                        }),
                        ...Object.fromEntries(
                            Object.entries(access(props.borderWidths)).map(([key, value]) => [
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
        const fillDefs = props.computeFillDefs?.(MOCK_GET_SIZE);
        const strokeDefs = props.computeStrokeDefs?.(MOCK_GET_SIZE);
        const lameExponents = access(props.lameExponents);

        return (
            fillDefs?.some(IS_COMPLEX_SVG_DEFS) ||
            strokeDefs?.some(IS_COMPLEX_SVG_DEFS) ||
            (lameExponents &&
                Object.values(lameExponents).some((v) => v !== ShapeConst.CORNER_SHAPE_LAME_EXPONENTS.round))
        );
    };

    return <Dynamic component={getIsComplex() ? SurfaceSVG : SurfaceDiv} {...props} />;
};
