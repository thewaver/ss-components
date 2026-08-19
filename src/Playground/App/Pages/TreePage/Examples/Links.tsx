import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { DOCS } from "../TreePage.const";
import type { TreeExampleProps } from "../TreePage.types";

type Props = TreeExampleProps;

export const LinksExample = (props: Props) => (
    <Tree
        getNodes={() => DOCS}
        valueSignal={props.valueSignal}
        expandedSignal={props.expandedSignal}
        getAriaLabel={() => "Documentation"}
        renderNode={(getNode, getFlags) => (
            <PageTreeNodeContent getFlags={getFlags}>{getNode().value}</PageTreeNodeContent>
        )}
    />
);
