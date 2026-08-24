import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeNode } from "../../../../../Lib/Fundamentals/Tree/Tree.types";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import type { TreeExampleProps } from "../TreePage.types";

import * as styles from "../TreePage.css";

const STRESS_NODE_HEIGHT = 28;

type Props = TreeExampleProps & { nodes: MaybeAccessor<TreeNode<string>[]> };

export const VirtualizedExample = (props: Props) => {
    return (
        <div class={styles.treeScroller}>
            <Tree
                nodes={props.nodes}
                valueSignal={props.valueSignal}
                expandedSignal={props.expandedSignal}
                ariaLabel={"Generated repository"}
                computeEstimatedNodeHeight={() => STRESS_NODE_HEIGHT}
                renderNode={(getNode, getFlags) => (
                    <PageTreeNodeContent flags={getFlags}>{getNode().value}</PageTreeNodeContent>
                )}
            />
        </div>
    );
};
