import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeNode } from "../../../../../Lib/Fundamentals/Tree/Tree.types";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { FILES } from "../TreePage.const";
import type { TreeExampleProps } from "../TreePage.types";

type Props = TreeExampleProps & { nodes?: MaybeAccessor<TreeNode<string>[]> };

export const FilesExample = (props: Props) => {
    return (
        <Tree
            nodes={props.nodes ?? (() => FILES)}
            valueSignal={props.valueSignal}
            expandedSignal={props.expandedSignal}
            ariaLabel={"Repository"}
            renderNode={(getNode, getFlags) => (
                <PageTreeNodeContent flags={getFlags}>{getNode().value}</PageTreeNodeContent>
            )}
        />
    );
};
