//=============================================================================
//汎用ラジオボタン
//=============================================================================
import { 
    Radio, 
    RadioGroup, 
    FormControlLabel, 
    FormControl, 
    FormLabel, 
    Box,
    SxProps,
    Theme
} from '@mui/material';
import { ReactNode } from 'react';

//ラジオボタンの選択肢の型定義
interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

//コンポーネントのプロパティ定義
interface RadioButtonComponentProps {
    groupLabel: string;                                   //ラジオボタングループのラベル
    name: string;                                         //フォームフィールド名
    value: string;                                        //現在選択されている値
    options: RadioOption[];                               //選択肢の配列
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;  //選択肢の変更を受け取るコールバック
    row?: boolean;                                        //横並び表示するか
    disabled?: boolean;                                   //全体を無効化するか
    required?: boolean;                                   //必須項目か
    size?: 'small' | 'medium';                           //ラジオボタンのサイズ
    color?: 'default' | 'primary' | 'secondary';         //ラジオボタンの色
    sx?: SxProps<Theme>;                                  //カスタムスタイル
    variant?: 'standard' | 'card' | 'modern';            //デザインバリエーション
}

const RadioButtonComponent = (props: RadioButtonComponentProps) => {
    const {
        groupLabel,
        name,
        value,
        options,
        onChange,
        row = false,
        disabled = false,
        required = false,
        size = 'medium',
        color = 'primary',
        sx = {},
        variant = 'standard'
    } = props;

    // バリエーション別スタイル
    const getVariantStyles = (): SxProps<Theme> => {
        switch (variant) {
        case 'card':
            return {
                '& .MuiFormControlLabel-root': {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    px: 3,
                    py: 2,
                    margin: '0 8px 8px 0',
                    border: '2px solid',
                    borderColor: 'transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.15)',
                        transform: 'translateY(-1px)'
                    },
                    '&.Mui-disabled': {
                        opacity: 0.5,
                        '&:hover': {
                            transform: 'none',
                            borderColor: 'transparent',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                '& .MuiFormControlLabel-root:has(.MuiRadio-root.Mui-checked)': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                    '& .MuiFormControlLabel-label': {
                        fontWeight: 600,
                        color: '#667eea'
                    }
                }
            } as SxProps<Theme>;
        
        case 'modern':
            return {
                '& .MuiFormControlLabel-root': {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    borderRadius: '16px',
                    px: 3,
                    py: 2.5,
                    margin: '0 12px 12px 0',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, transparent, rgba(102, 126, 234, 0.1))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                        '&:before': {
                            opacity: 1
                        }
                    },
                    '&.Mui-disabled': {
                        opacity: 0.4,
                        '&:hover': {
                            transform: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            '&:before': {
                                opacity: 0
                            }
                        }
                    }
                },
                '& .MuiRadio-root': {
                    color: '#667eea',
                    '&.Mui-checked': {
                        color: '#667eea'
                    }
                },
                '& .MuiFormControlLabel-label': {
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#333'
                },
                '& .MuiFormControlLabel-root:has(.MuiRadio-root.Mui-checked)': {
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                    transform: 'translateY(-2px)',
                    '& .MuiFormControlLabel-label': {
                        color: 'white',
                        fontWeight: 700
                    },
                    '& .MuiRadio-root': {
                        color: 'white'
                    },
                    '&:before': {
                        opacity: 0
                    }
                }
            } as SxProps<Theme>;
        
        default:
            return {
                '& .MuiFormControlLabel-root': {
                    '& .MuiFormControlLabel-label': {
                        fontSize: size === 'small' ? '0.875rem' : '1rem',
                        fontWeight: 500
                    }
                },
                '& .MuiRadio-root': {
                    color: color === 'primary' ? '#667eea' : 'inherit',
                    '&.Mui-checked': {
                        color: color === 'primary' ? '#667eea' : 'inherit'
                    }
                }
            } as SxProps<Theme>;
        }
    };

    return (
        <FormControl 
            component="fieldset" 
            disabled={disabled} 
            required={required}
            sx={{
                width: '100%',
                ...sx
            }}
        >
            {groupLabel && (
                <FormLabel 
                    component="legend"
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#333',
                        mb: variant === 'standard' ? 1 : 2,
                        '&.Mui-focused': {
                            color: '#667eea'
                        }
                    }}
                >
                    {groupLabel}
                </FormLabel>
            )}
            
            <Box sx={getVariantStyles()}>
                <RadioGroup
                    aria-label={groupLabel}
                    name={name}
                    value={value}
                    onChange={onChange}
                    row={row}
                    sx={{
                        gap: variant === 'standard' ? 0.5 : 0,
                        flexWrap: 'wrap'
                    }}
                >
                    {options.map((option) => (
                        <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio size={size} color={color} />}
                            label={option.label}
                            disabled={option.disabled}
                        />
                    ))}
                </RadioGroup>
            </Box>
        </FormControl>
    );
};

export default RadioButtonComponent;