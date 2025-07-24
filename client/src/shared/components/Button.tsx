//=============================================================================
//汎用ボタン
//=============================================================================
import { Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

//ボタンの外見、押下時動作の定義
interface ButtonComponentProps extends ButtonProps  {
    variant: 'text' | 'outlined' | 'contained';
    label: string;
    onClick: (event: React.MouseEvent) => void | Promise<void>;
    color: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    size: 'small' | 'medium' | 'large';
    disabled?: boolean;
    startIcon?: ReactNode;
};

const ButtonComponent = (props: ButtonComponentProps) => {
    return (
        <Button
            variant={props.variant}
            onClick={props.onClick}
            color={props.color}
            size={props.size}
            disabled={props.disabled}
            sx={props.sx}
            startIcon={props.startIcon}
        >
            {props.label}
        </Button>
    );
};

export default ButtonComponent
