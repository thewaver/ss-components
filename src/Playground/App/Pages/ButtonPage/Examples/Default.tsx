import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { ButtonExampleProps } from "../ButtonPage.types";

type Props = ButtonExampleProps;

export const DefaultExample = (props: Props) => (
    <Button
        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>}
        onClick={props.onClick}
    />
);
