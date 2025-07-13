import { TextField, TextFieldProps } from "@mui/material"

interface InputFormProps extends Omit<TextFieldProps, 'onChange'> {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

const InputFormConmponent: React.FC<InputFormProps> = (props: InputFormProps) => {
    return (
        <TextField
            {...props}
            label={props.label}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
        />
    )
};

export default InputFormConmponent