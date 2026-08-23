import type { ParentProps } from "solid-js";

import { ShapeConst } from "@thewaver/ss-utils";

import { Shape } from "../../../../Lib/Exotics/Shape/Shape";
import { access } from "../../../../Lib/Utils/propUtils";
import type { PageFormationItemProps } from "./FormationContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./FormationContent.css";

const EDGE_THICKNESSES = [2];
const FILL_OPACITY = 0.75;

export const PageFormationItem = (props: ParentProps<PageFormationItemProps>) => {
    return (
        <div class={styles.formationItem}>
            <Shape
                computePoints={(size) => ShapeConst.getDefaultShapePoints(access(props.shapeKind), size)}
                computeFillDefs={() => [{ color: themeVars.color.control.background.main, opacity: FILL_OPACITY }]}
                computeStrokeDefs={() => [{ color: themeVars.color.primary.main }]}
                strokeGeom={() => [{ thicknesses: EDGE_THICKNESSES }]}
                renderChildren={() => (
                    <div class={styles.formationItemContent}>
                        <div class={styles.formationItemRank}>{access(props.state).index + 1}</div>

                        {props.children}
                    </div>
                )}
            />
        </div>
    );
};
