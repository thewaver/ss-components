import { TextField } from "../TextField/TextField";
import type { TextAreaProps } from "./TextArea.types";

export const TextArea = (props: TextAreaProps) => <TextField {...props} element={"textarea"} />;
