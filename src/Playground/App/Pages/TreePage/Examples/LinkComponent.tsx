import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import type { TreeLinkProps } from "../../../../../Lib/Fundamentals/Tree/Tree.types";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { DOCS } from "../TreePage.const";
import type { TreeExampleProps } from "../TreePage.types";

const PageTreeLink = (props: TreeLinkProps) => <a {...props} data-link-component />;

type Props = TreeExampleProps;

export const LinkComponentExample = (props: Props) => (
    <Tree
        getNodes={() => DOCS}
        valueSignal={props.valueSignal}
        expandedSignal={props.expandedSignal}
        getAriaLabel={() => "Routed documentation"}
        linkComponent={PageTreeLink}
        renderNode={(getNode, getFlags) => (
            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
        )}
    />
);
