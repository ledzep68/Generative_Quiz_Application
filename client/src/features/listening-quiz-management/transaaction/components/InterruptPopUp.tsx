//======
//中断時のポップアップ
//======

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface QuizInterruptPopupProps {
    open: boolean;
    onClose: () => void;
    onMainMenu: () => void;
    onLogout: () => void;
}

const QuizInterruptPopup: React.FC<QuizInterruptPopupProps> = ({
    open,
    onClose,
    onMainMenu,
    onLogout
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, padding: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        クイズを中断しますか？
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          進行中のクイズが保存されずに終了されます。<br />
          本当に中断しますか？
        </Typography>
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', gap: 2, px: 3, pb: 2 }}>
        <Button onClick={onMainMenu} variant="contained" color="primary" fullWidth size="large">
          メインメニューに戻る
        </Button>
        <Button onClick={onLogout} variant="outlined" color="error" fullWidth size="large">
          ログアウト
        </Button>
        <Button onClick={onClose} variant="text" fullWidth>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizInterruptPopup;