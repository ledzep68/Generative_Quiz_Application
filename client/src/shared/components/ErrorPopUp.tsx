//=============================================================================
//汎用エラーダイアログ表示
//=============================================================================
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface ErrorPopupProps {
    open: boolean;
    severity: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    actions: ErrorAction[];
    onClose: () => void;
}

interface ErrorAction {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error';
    loading?: boolean;
}

const ErrorPopupComponent: React.FC<ErrorPopupProps> = ({
    open,
    severity,
    title,
    message,
    actions,
    onClose
}) => {
    const getIcon = () => {
        switch (severity) {
        case 'error': return <ErrorIcon color="error" />;
        case 'warning': return <WarningIcon color="warning" />;
        case 'info': return <InfoIcon color="info" />;
        }
    };

    return (
        <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon()}
            {title}
        </DialogTitle>
        
        <DialogContent>
            <Typography>{message}</Typography>
        </DialogContent>
        
        <DialogActions sx={{ gap: 1, p: 3 }}>
            {actions.map((action, index) => (
            <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.loading}
                startIcon={action.loading ? <CircularProgress size={16} /> : undefined}
            >
                {action.label}
            </Button>
            ))}
        </DialogActions>
        </Dialog>
    );
};

export default ErrorPopupComponent;