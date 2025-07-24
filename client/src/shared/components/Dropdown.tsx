//=============================================================================
//汎用プルダウンメニュー
//=============================================================================
import { Box, Typography, FormControl, FormHelperText, InputLabel, Select, SelectProps, FormControlProps, MenuItem } from '@mui/material';
import { useState, ReactNode } from 'react';

const DROPDOWN_CONFIGS = { //不変定数の名前は全大文字で定義
    sectionNum: {
        label: "問題Part（2~4から選択　1は未実装）",
        //placeholder: '問題Partを選択',
        options: [
            /*{ value: 1, label: 'Part1' },*/
            { value: 2, label: 'Part2' },
            { value: 3, label: 'Part3' },
            { value: 4, label: 'Part4' },
        ]
    },
    numOfLQuizs: {
        label: "問題数",
        //placeholder: '問題数を選択',
        options: [
            { value: 1, label: '1問' },
            { value: 2, label: '2問' },
            { value: 3, label: '3問' },
            { value: 4, label: '4問' },
            { value: 5, label: '5問' },
            { value: 6, label: '6問' },
            { value: 7, label: '7問' },
            { value: 8, label: '8問' },
            { value: 9, label: '9問' },
            { value: 10, label: '10問' }
        ]
    },
    speakerAccent: {
        label: "アクセント（任意）",
        //placeholder: 'アクセントを選択',
        options: [
            { value: ' ', label: ' ' },
            { value: 'American', label: 'アメリカ英語' },
            { value: 'British', label: 'イギリス英語' },
            { value: 'Canadian', label: 'カナダ英語' },
            { value: 'Australian', label: 'オーストラリア英語' },
        ]
    }
}

interface DropdownProps extends Omit<SelectProps, 'labelId' | 'label'> {
    type: keyof typeof DROPDOWN_CONFIGS;
    
    //FormControlから継承
    error?: FormControlProps['error'];
    disabled?: FormControlProps['disabled'];
    fullWidth?: FormControlProps['fullWidth'];
    size?: FormControlProps['size'];
    variant?: FormControlProps['variant']

    helperText?: string;
};

// 汎用Dropdownコンポーネント
function DropdownComponent({
    type,
    value,
    onChange,
    error = false,
    disabled = false,
    fullWidth = true,
    size = 'medium',
    variant = 'outlined',
    helperText,
    sx,
    ...selectProps
    }: DropdownProps) {

    const config = DROPDOWN_CONFIGS[type];
    const labelId = `${type}-dropdown-label`;
    const selectId = `${type}-dropdown`;

    return (
        <Box>
            <Typography 
                variant="body2" 
                sx={{ mb: 1, fontWeight: 500, color: error ? 'error.main' : 'text.primary' }}
            >
                {config.label}
            </Typography>

            <FormControl
            fullWidth={fullWidth}
            error={error}
            disabled={disabled}
            size={size}
            variant={variant}
            sx={sx}
            >
            <InputLabel id={labelId}>
                {/*{config.placeholder}*/}
            </InputLabel>
            <Select
                labelId={labelId}
                id={selectId}
                value={value}
                
                onChange={onChange}
                {...selectProps}
            >
                {config.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
                ))}
            </Select>
            {helperText && (
                <FormHelperText>
                {helperText}
                </FormHelperText>
            )}
            </FormControl>
        </Box>
  );
}

export default DropdownComponent
