import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeNode } from "../../../../../Lib/Fundamentals/Tree/Tree.types";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { FILES } from "../TreePage.const";
import type { TreeExampleProps } from "../TreePage.types";

type Props = TreeExampleProps & { getNodes?: () => TreeNode<string>[] };

export const FilesExample = (props: Props) => (
    <Tree
        getNodes={props.getNodes ?? (() => FILES)}
        valueSignal={props.valueSignal}
        expandedSignal={props.expandedSignal}
        getAriaLabel={() => "Repository"}
        renderNode={(getNode, getFlags) => (
            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
        )}
    />
);
