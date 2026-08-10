import { splitProps } from "solid-js";

import { CellAnimation } from "../CellAnimation/CellAnimation";
import type { ScanlineAnimationProps } from "./ScanlineAnimation.types";

export const ScanlineAnimation = (props: ScanlineAnimationProps) => {
    const [local, otherProps] = splitProps(props, ["getLineCount", "computeScanlineAnimation"]);

    return (
        <CellAnimation
            {...otherProps}
            getCellCount={() => ({ x: 1, y: local.getLineCount() })}
            computeCellAnimation={(defs, timeline) => local.computeScanlineAnimation(defs, timeline)}
        />
    );
};
