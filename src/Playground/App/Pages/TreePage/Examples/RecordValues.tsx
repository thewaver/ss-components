import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { ASSETS } from "../TreePage.const";
import type { TreeRecordExampleProps } from "../TreePage.types";

type Props = TreeRecordExampleProps;

export const RecordValuesExample = (props: Props) => (
    <Tree
        getNodes={() => ASSETS}
        valueSignal={props.valueSignal}
        expandedSignal={props.expandedSignal}
        getAriaLabel={() => "Assets"}
        renderNode={(getNode, getFlags) => (
            <PageTreeNodeContent getFlags={getFlags} getDetail={() => getNode().value.kind}>
                {getNode().value.name}
            </PageTreeNodeContent>
        )}
    />
);
