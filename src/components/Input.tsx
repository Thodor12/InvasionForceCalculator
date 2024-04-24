import { TextField, type TextFieldProps } from "@mui/material";

type Props = Omit<TextFieldProps, "size">;

export function Input(props: Props) {
  return (
    <TextField
      {...props}
      size="small"
    />
  )
}