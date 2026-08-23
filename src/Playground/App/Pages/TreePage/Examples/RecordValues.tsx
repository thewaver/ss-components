import { Tree } from "../../../../../Lib/Fundamentals/Tree/Tree";
import { PageTreeNodeContent } from "../../../StyledComponents/TreeNodeContent/TreeNodeContent";
import { ASSETS } from "../TreePage.const";
import type { TreeRecordExampleProps } from "../TreePage.types";

type Props = TreeRecordExampleProps;

export const RecordValuesExample = (props: Props) => (
    <Tree
        nodes={() => ASSETS}
        valueSignal={props.valueSignal}
        expandedSignal={props.expandedSignal}
        ariaLabel={"Assets"}
        renderNode={(getNode, getFlags) => (
            <PageTreeNodeContent flags={getFlags} detail={() => getNode().value.kind}>
                {getNode().value.name}
            </PageTreeNodeContent>
        )}
    />
);
