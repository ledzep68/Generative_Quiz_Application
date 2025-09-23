//=============================================================================
//汎用ローディング表示
//=============================================================================
import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

export interface LoadingModalProps {
  //モーダル表示
  open: boolean;
  //表示するメッセージ（デフォルト: '読み込み中...'）
  message?: string;
  //ローディングスピナーのサイズ（デフォルト: 60）
  size?: number;
  // スピナーの太さ（デフォルト: 4）
  thickness?: number;
  sx?: any;
  //ESCキーでの閉じる操作を許可するか（デフォルト: false）
  disableEscapeKeyDown?: boolean;
}

const LoadingModalComponent: React.FC<LoadingModalProps> = ({ 
  open, 
  message = '読み込み中...',
  size = 60,
  thickness = 4,
  sx,
  disableEscapeKeyDown = true
}) => {
    return (
        <Dialog
        open={open}
        maxWidth="sm"
        fullWidth={false}
        disableEscapeKeyDown={disableEscapeKeyDown}
        aria-labelledby="loading-dialog"
        aria-describedby="loading-dialog-description"
        slotProps={{
            paper: {
            sx: {
                borderRadius: 3,
                padding: 2,
                minWidth: 320,
                textAlign: 'center',
                ...sx
            }
            },
            backdrop: {
            sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }
            }
        }}
        >
        <DialogContent>
            <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={3}
            py={2}
            >
            <CircularProgress 
                size={size}
                thickness={thickness}
                sx={{
                color: 'primary.main'
                }}
            />
            <Typography 
                variant="h6" 
                component="div"
                id="loading-dialog-description"
                sx={{
                fontWeight: 500,
                color: 'text.primary'
                }}
            >
                {message}
            </Typography>
            </Box>
        </DialogContent>
        </Dialog>
    );
};

export default LoadingModalComponent;