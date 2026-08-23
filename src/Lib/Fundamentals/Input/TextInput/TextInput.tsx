import { TextField } from "../TextField/TextField";
import type { TextInputProps } from "./TextInput.types";

export const TextInput = (props: TextInputProps) => <TextField {...props} element={"input"} />;
