import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { ButtonErroredExampleProps } from "../ButtonPage.types";

type Props = ButtonErroredExampleProps;

export const ErroredExample = (props: Props) => (
    <Button
        getHasError={props.getHasError}
        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Toggle Error</PageButtonContent>}
        onClick={props.onClick}
    />
);
