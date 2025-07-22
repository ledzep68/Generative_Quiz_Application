//=============================================================================
//汎用チェックボックス
//=============================================================================
import React from 'react';
import { FormControlLabel, Checkbox, FormHelperText, Box } from '@mui/material';

interface CheckboxComponentProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    helperText?: string;
    disabled?: boolean;
    color?: 'primary' | 'secondary' | 'default';
    size?: 'small' | 'medium';
    sx?: object;
}

const CheckboxComponent: React.FC<CheckboxComponentProps> = ({
    label,
    checked,
    onChange,
    helperText,
    disabled = false,
    color = 'primary',
    size = 'medium',
    sx = {}
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    };

    return (
        <Box sx={sx}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={checked}
                        onChange={handleChange}
                        color={color}
                        size={size}
                        disabled={disabled}
                    />
                }
                label={label}
            />
            {helperText && (
                <FormHelperText sx={{ ml: 0 }}>
                    {helperText}
                </FormHelperText>
            )}
        </Box>
    );
};

export default CheckboxComponent;