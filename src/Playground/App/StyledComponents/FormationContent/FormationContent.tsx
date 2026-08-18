import { ShapeConst } from "@thewaver/ss-utils";

import { Shape } from "../../../../Lib/Exotics/Shape/Shape";
import type { PageFormationItemProps } from "./FormationContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./FormationContent.css";

const EDGE_THICKNESSES = [2];
const FILL_OPACITY = 0.95;

export const PageFormationItem = (props: PageFormationItemProps) => (
    <div class={styles.formationItem}>
        <Shape
            computePoints={(size) => ShapeConst.getDefaultShapePoints(props.getShapeKind(), size)}
            computeFillDefs={() => [{ color: themeVars.color.background.light, opacity: FILL_OPACITY }]}
            computeStrokeDefs={() => [{ color: themeVars.color.primary.main }]}
            getStrokeGeom={() => [{ thicknesses: EDGE_THICKNESSES }]}
            renderChildren={() => (
                <div class={styles.formationItemContent}>
                    <div class={styles.formationItemRank}>{props.getState().index + 1}</div>

                    {props.children}
                </div>
            )}
        />
    </div>
);
